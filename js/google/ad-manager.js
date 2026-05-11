/**
 * 广告加载管理器 (支持外部 TXT/JSON 配置)
 * 负责异步获取配置、动态注入脚本及广告块
 */
(function () {
  window.adsbygoogle = window.adsbygoogle || [];

  const AdManager = {
    configUrl: (function () {
      const scripts = document.getElementsByTagName("script");
      for (let script of scripts) {
        if (script.src.includes("ad-manager.js")) {
          const path = script.src.split("?")[0];
          return (
            path.substring(0, path.lastIndexOf("/") + 1) + "ad-config.json"
          );
        }
      }
      return "./js/google/ad-config.json";
    })(), // 自动根据 ad-manager.js 路径计算配置文件路径

    init: async function () {
      try {
        // 1. 异步获取配置
        const response = await fetch(
          this.configUrl + "?v=" + new Date().getTime(),
        ); // 加时间戳防止缓存
        if (!response.ok) throw new Error("Failed to load ad-config.json");

        window.AD_CONFIG = await response.json();

        // 检查总开关
        if (window.AD_CONFIG.global.adEnabled === 0) {
          console.log("Ads are globally disabled via config.");
          return;
        }

        // 2. 注入头部脚本
        this.injectAdSenseScript();

        // 3. 页面加载完成后触发广告显示
        $(document).ready(() => {
          this.renderPageAds();
          this.detectAdBlock();
        });
      } catch (error) {
        console.error("AdManager Init Error:", error);
      }
    },

    renderPageAds: function () {
      if (!window.AD_CONFIG || window.AD_CONFIG.global.adEnabled === 0) return;

      const currentPage = this.getCurrentPage();
      const pageAds =
        window.AD_CONFIG.pages[currentPage] ||
        window.AD_CONFIG.pages["default"] ||
        [];

      if (pageAds.length === 0) return;

      pageAds.forEach((ad) => {
        // 检查单个广告模块开关
        if (ad.enabled !== 0) {
          this.renderAd(ad);
        }
      });
    },

    injectAdSenseScript: function () {
      let adClient = window.AD_CONFIG.global.adClient;
      if (!adClient) return;

      adClient = adClient.trim();

      if (document.querySelector(`script[src*="${adClient}"]`)) return;

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
      script.crossOrigin = "anonymous";

      const head = document.head || document.getElementsByTagName("head")[0];
      head.insertBefore(script, head.firstChild);
    },

    getCurrentPage: function () {
      const path = window.location.pathname;
      let page = path.split("/").pop();
      if (!page || page === "" || page === "/") {
        page = "index.html";
      }
      return page;
    },

    detectAdBlock: function () {
      // 创建 bait 元素检测 AdBlock
      const bait = document.createElement("div");
      bait.className = "adsbox ad-banner ad-placeholder adsbygoogle";
      bait.style.cssText =
        "position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;";
      document.body.appendChild(bait);

      // 给 AdSense 充足时间加载，再检查
      setTimeout(() => {
        const isBlocked =
          bait.offsetParent === null ||
          bait.offsetHeight === 0 ||
          bait.offsetWidth === 0 ||
          bait.getClientRects().length === 0;

        document.body.removeChild(bait);

        if (isBlocked) {
          document.documentElement.setAttribute("data-adblock", "true");
          this.hideEmptyPlaceholders();
        }
      }, 2000);
    },

    hideEmptyPlaceholders: function () {
      // 隐藏所有仍未填充的广告占位符
      const selectors = [
        ".ad-placeholder-top",
        ".ad-placeholder-bottom",
        ".ad-placeholder-category",
        ".ad-placeholder-list",
      ];

      selectors.forEach(function (sel) {
        document.querySelectorAll(sel).forEach(function (el) {
          // 如果占位符内没有已填充的 adsbygoogle ins，隐藏它
          const hasFilledAd = el.querySelector(
            'ins.adsbygoogle[data-ad-status="filled"]',
          );
          if (!hasFilledAd) {
            el.style.setProperty("display", "none", "important");
          }
        });
      });

      // 同时隐藏 wrapper
      document
        .querySelectorAll(".ad-placeholder-category-wrapper")
        .forEach(function (el) {
          const hasFilledAd = el.querySelector(
            'ins.adsbygoogle[data-ad-status="filled"]',
          );
          if (!hasFilledAd) {
            el.style.setProperty("display", "none", "important");
          }
        });
    },

    renderAd: function (ad) {
      const $container = $(ad.selector);
      // 只有当容器存在且尚未处理时才处理
      if ($container.length > 0 && !$container.attr("data-ad-status")) {
        $container.attr("data-ad-status", "pending"); // 标记为处理中

        const adClient = window.AD_CONFIG.global.adClient;
        const adTest = window.AD_CONFIG.global.adTest;

        // 1. 先注入 ins 标签，但先不执行 push
        const adHtml = `
                    <ins class="adsbygoogle"
                         style="${ad.style || "display:block; min-height:250px;"}"
                         data-ad-client="${adClient}"
                         data-ad-slot="${ad.slot}"
                         ${ad.format ? `data-ad-format="${ad.format}"` : ""}
                         ${ad.responsive ? `data-full-width-responsive="${ad.responsive}"` : ""}
                         ${adTest ? `data-adtest="${adTest}"` : ""}></ins>
                `;
        $container.empty().append(adHtml);

        // 2. 使用 IntersectionObserver 监听容器，确保其进入视口且具有宽度
        // 注意：由于容器初始 display:none，我们需要一个临时的可见父级或改变策略
        // 这里我们先让它 visible，如果 push 失败再 hide
        $container.addClass("is-visible");

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const rect = entry.boundingClientRect;
                if (rect.width > 0) {
                  observer.unobserve(entry.target);
                  this.activateAd($container);
                }
              }
            });
          },
          { threshold: 0.1 },
        );

        observer.observe($container[0]);
      }
    },

    activateAd: function ($container) {
      setTimeout(() => {
        const $ins = $container.find(".adsbygoogle");
        const containerWidth = $container.width();
        const insWidth = $ins.width();
        const finalWidth = Math.max(containerWidth, insWidth);

        if (finalWidth > 0) {
          try {
            console.log(`Activating Ad in container, width: ${finalWidth}`);
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            $container.attr("data-ad-status", "loaded");

            // 监听 Google 是否填充了广告
            this.watchAdFill($container);
          } catch (e) {
            console.error("AdSense push error:", e);
            $container.removeClass("is-visible"); // 出错则隐藏
          }
        } else {
          console.warn("Ad width is still 0, hiding container");
          $container.removeClass("is-visible");
          $container.removeAttr("data-ad-status");
        }
      }, 100);
    },

    watchAdFill: function ($container) {
      let checkCount = 0;
      const maxChecks = 50; // 最多检查 5 秒 (50 * 100ms)

      const interval = setInterval(() => {
        const $ins = $container.find("ins.adsbygoogle");
        const status = $ins.attr("data-ad-status");

        // Google AdSense 会在 ins 标签上设置 data-ad-status 属性
        // unfilled 代表没有广告填充
        if (status === "unfilled") {
          console.log("Ad unfilled, hiding container");
          $container.removeClass("is-visible");
          clearInterval(interval);
        } else if (status === "filled") {
          console.log("Ad filled successfully");
          $container.addClass("is-visible");
          clearInterval(interval);
        }

        checkCount++;
        if (checkCount >= maxChecks) {
          // 如果超时且 ins 内部还是空的，可能加载失败
          if ($ins.is(":empty")) {
            $container.removeClass("is-visible");
          }
          clearInterval(interval);
        }
      }, 100);
    },
  };

  // 暴露到全局以便动态调用
  window.AdManager = AdManager;

  // 启动管理器
  AdManager.init();
})();
