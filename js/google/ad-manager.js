/**
 * GPT 广告加载管理器
 * 使用 Google Publisher Tag (GPT) 动态加载展示广告 & 插屏广告
 */
(function () {
  window.googletag = window.googletag || { cmd: [] };

  const AdManager = {
    configUrl: (function () {
      var scripts = document.getElementsByTagName("script");
      for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].src.includes("ad-manager.js")) {
          var path = scripts[i].src.split("?")[0];
          return path.substring(0, path.lastIndexOf("/") + 1) + "ad-config.json";
        }
      }
      return "./js/google/ad-config.json";
    })(),

    slotCounter: 0,
    renderedSlots: {},

    init: async function () {
      try {
        var response = await fetch(
          this.configUrl + "?v=" + new Date().getTime()
        );
        if (!response.ok) throw new Error("Failed to load ad-config.json");

        window.AD_CONFIG = await response.json();

        if (window.AD_CONFIG.global.adEnabled === 0) {
          console.log("Ads are globally disabled via config.");
          return;
        }

        this.loadGPT();

        $(document).ready(function () {
          AdManager.renderPageAds();
          AdManager.detectAdBlock();
        });
      } catch (error) {
        console.error("AdManager Init Error:", error);
      }
    },

    loadGPT: function () {
      if (document.querySelector('script[src*="securepubads.g.doubleclick.net"]')) {
        return;
      }

      // Push setup commands (executed when GPT script loads)
      googletag.cmd.push(function () {
        googletag.setConfig({ singleRequest: true, collapseDiv: 'ON_NO_FILL' });
        googletag.enableServices();

        // Interstitial / OpenScreen
        if (
          window.AD_CONFIG.interstitial &&
          window.AD_CONFIG.interstitial.enabled !== 0
        ) {
          var slot = googletag.defineOutOfPageSlot(
            window.AD_CONFIG.interstitial.adUnit,
            googletag.enums.OutOfPageFormat.INTERSTITIAL
          );
          if (slot) {
            slot.addService(googletag.pubads());
            googletag.display(slot);
          }
        }
      });

      // Global slot render listener (once)
      googletag.cmd.push(function () {
        googletag.pubads().addEventListener("slotRenderEnded", function (event) {
          var slotId = event.slot.getSlotElementId();
          var info = AdManager.renderedSlots[slotId];
          if (!info) return;

          if (event.isEmpty) {
            info.$container.attr("data-ad-status", "unfilled");
            info.$container.removeClass("is-visible");
          } else {
            info.$container.attr("data-ad-status", "filled");
            info.$container.addClass("is-visible");
          }

          delete AdManager.renderedSlots[slotId];
        });
      });

      // Load GPT library
      var script = document.createElement("script");
      script.async = true;
      script.src = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";

      var head = document.head || document.getElementsByTagName("head")[0];
      head.insertBefore(script, head.firstChild);
    },

    renderPageAds: function () {
      if (!window.AD_CONFIG || window.AD_CONFIG.global.adEnabled === 0) return;

      var currentPage = this.getCurrentPage();
      var pageAds =
        window.AD_CONFIG.pages[currentPage] ||
        window.AD_CONFIG.pages["default"] ||
        [];

      if (pageAds.length === 0) return;

      for (var i = 0; i < pageAds.length; i++) {
        if (pageAds[i].enabled !== 0) {
          this.renderAd(pageAds[i]);
        }
      }
    },

    getCurrentPage: function () {
      var path = window.location.pathname;
      var page = path.split("/").pop();
      if (!page || page === "" || page === "/") {
        page = "index.html";
      }
      return page;
    },

    renderAd: function (ad) {
      var $container = $(ad.selector);
      if ($container.length === 0 || $container.attr("data-ad-status")) return;

      $container.attr("data-ad-status", "pending");

      var slotId = "gpt-ad-" + this.slotCounter++;
      var $adDiv = $('<div id="' + slotId + '"></div>');
      $container.empty().append($adDiv);

      $container.addClass("is-visible");

      var observer = new IntersectionObserver(
        function (entries) {
          for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            if (entry.isIntersecting && entry.boundingClientRect.width > 0) {
              observer.unobserve(entry.target);
              AdManager.activateAd(ad, slotId, $container);
            }
          }
        },
        { threshold: 0.1 }
      );

      observer.observe($container[0]);
    },

    activateAd: function (ad, slotId, $container) {
      googletag.cmd.push(function () {
        var slot = googletag.defineSlot(ad.adUnit, ad.sizes, slotId);
        if (!slot) {
          $container.removeAttr("data-ad-status");
          $container.removeClass("is-visible");
          return;
        }

        // Responsive size mapping
        if (ad.sizeMapping && ad.sizeMapping.length > 0) {
          var mapping = googletag.sizeMapping();
          for (var i = 0; i < ad.sizeMapping.length; i++) {
            mapping.addSize(ad.sizeMapping[i].viewport, ad.sizeMapping[i].sizes);
          }
          slot.defineSizeMapping(mapping.build());
        }

        slot.addService(googletag.pubads());

        AdManager.renderedSlots[slotId] = { $container: $container };
        googletag.display(slotId);
      });
    },

    detectAdBlock: function () {
      var bait = document.createElement("div");
      bait.className = "adsbox ad-banner ad-placeholder";
      bait.style.cssText =
        "position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;";
      document.body.appendChild(bait);

      setTimeout(function () {
        var isBlocked =
          bait.offsetParent === null ||
          bait.offsetHeight === 0 ||
          bait.offsetWidth === 0 ||
          bait.getClientRects().length === 0;

        document.body.removeChild(bait);

        if (isBlocked) {
          document.documentElement.setAttribute("data-adblock", "true");
          AdManager.hideEmptyPlaceholders();
        }
      }, 2000);
    },

    hideEmptyPlaceholders: function () {
      var selectors = [
        ".ad-placeholder-top",
        ".ad-placeholder-bottom",
        ".ad-placeholder-category",
        ".ad-placeholder-list",
      ];

      for (var s = 0; s < selectors.length; s++) {
        var els = document.querySelectorAll(selectors[s]);
        for (var e = 0; e < els.length; e++) {
          if (els[e].getAttribute("data-ad-status") !== "filled") {
            els[e].style.setProperty("display", "none", "important");
          }
        }
      }

      var wrappers = document.querySelectorAll(".ad-placeholder-category-wrapper");
      for (var w = 0; w < wrappers.length; w++) {
        var hasFilled = wrappers[w].querySelector('[data-ad-status="filled"]');
        if (!hasFilled) {
          wrappers[w].style.setProperty("display", "none", "important");
        }
      }
    },
  };

  window.AdManager = AdManager;
  AdManager.init();
})();
