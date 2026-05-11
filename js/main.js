$(function () {
  const container = $(".content-area");
  let currentPage = 1;
  const pageSize = 24;

  // 如果是首页，则执行动态加载逻辑
  if (
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname.endsWith("/") ||
    window.location.pathname.endsWith("index.shtml")
  ) {
    loadHomePageData();
  } else if (window.location.pathname.endsWith("types.html")) {
    loadListPageData();
  }

  function loadListPageData(isLoadMore = false) {
    const params = new URLSearchParams(window.location.search);
    const tid = params.get("utm_medium") || params.get("tid") || "2";
    
    // 从缓存中获取分类名称，避免在 URL 中显示 name 参数
    let categoryName = "Games";
    const cachedCategories = JSON.parse(sessionStorage.getItem("sidebar_categories") || "[]");
    const currentCategory = cachedCategories.find(c => String(c.mid) === String(tid));
    if (currentCategory) {
      categoryName = currentCategory.mname;
    }

    if (!isLoadMore) {
      currentPage = 1;
      $("#loadingMask").fadeIn(200);
      $(".main h2").text(categoryName);
      $(".games_list").empty();
      $(".load-more-container").hide();
    }

    $.get(baseUrl + "/glib/types", {
      tid: tid,
      size: pageSize,
      pg: currentPage,
    })
      .done(function (res) {
        if (res && res.data && res.data.length > 0) {
          renderListPage(res.data, res.catename, isLoadMore);

          // 判断是否还有更多数据
          if (res.data.length < pageSize) {
            $(".load-more-container").hide();
          } else {
            $(".load-more-container").show();
          }
        } else {
          $(".load-more-container").hide();
          if (!isLoadMore) {
            $(".games_list").append(
              '<p style="text-align: center; width: 100%; grid-column: 1/-1; padding: 40px; color: #666;">No games found in this category.</p>',
            );
          }
        }
      })
      .fail(function (err) {
        console.error("Failed to load list data:", err);
        if (!isLoadMore) {
          $(".games_list").append(
            '<p style="text-align: center; width: 100%; grid-column: 1/-1; padding: 40px; color: #666;">Failed to load games. Please try again later.</p>',
          );
        }
      })
      .always(function () {
        if (!isLoadMore) {
          $("#loadingMask").fadeOut(200);
        }
      });
  }

  function renderListPage(games, catename, isLoadMore) {
    const $ul = $(".games_list");
    if (catename) {
      $(".main h2").text(catename);
    }
    const params = new URLSearchParams(window.location.search);
    const tid = params.get("utm_medium") || params.get("tid") || "2";

    const currentCount = isLoadMore ? $ul.find("li").length : 0;

    games.forEach((game, index) => {
      appendGameItem($ul, game, 0, currentCount + index, "category", tid);
    });

    // 渲染完成后触发广告
    if (window.AdManager) {
      window.AdManager.renderPageAds();
    }
  }

  // 点击加载更多
  $(document).on("click", "#loadMoreBtn", function (e) {
    e.preventDefault();
    currentPage++;
    loadListPageData(true);
  });

  function loadHomePageData() {
    $("#loadingMask").fadeIn(200);
    $.get(baseUrl + "/glib/home", { psize: 12 })
      .done(function (res) {
        if (res && res.dlist) {
          renderSidebar(res.dlist); // 动态渲染侧边栏
          renderDynamicNav(res.dlist); // 动态渲染导航栏
          renderHomePage(res.dlist);
          // 存储完整的分类列表供其他页面使用
          sessionStorage.setItem(
            "sidebar_categories",
            JSON.stringify(res.dlist),
          );
          // 存储随机分类供搜索使用
          const randomCat =
            res.dlist[Math.floor(Math.random() * res.dlist.length)];
          sessionStorage.setItem("randomCategory", JSON.stringify(randomCat));
        }
      })
      .fail(function (err) {
        console.error("Failed to load home data:", err);
      })
      .always(function () {
        $("#loadingMask").fadeOut(200);
      });
  }

  function renderHomePage(categories) {
    container.empty();
    categories.forEach((category, catIndex) => {
      const $section = $(`
        <div class="games-section" id="section_${category.mid}">
          <div class="section-header">
            <h2>${category.mname}</h2>
          </div>
          <ul class="games_list" id="games_list_${category.mid}"></ul>
          <div class="load-more-container">
            <a href="./types.html?utm_medium=${category.mid}" class="btn-more">More ${category.mname}</a>
          </div>
        </div>
      `);

      const $ul = $section.find(".games_list");
      // 首页每个分类只展示最多 8 个（桌面端一行）
      const gamesToShow = category.dlist.slice(0, 8);
      gamesToShow.forEach((game, gameIndex) => {
        appendGameItem($ul, game, catIndex, gameIndex, "home", category.mid);
      });

      container.append($section);

      // 插入分类间的广告逻辑
      if (window.AD_CONFIG && window.AD_CONFIG.pages["index.html"] && window.AD_CONFIG.global.adEnabled !== 0) {
        const pageAds = window.AD_CONFIG.pages["index.html"];
        pageAds.forEach((ad) => {
          if (
            typeof ad.categoryPosition !== "undefined" &&
            ad.categoryPosition === catIndex &&
            ad.enabled !== 0
          ) {
            container.append(`
              <div class="ad-placeholder-category-wrapper" style="margin: 40px 0;">
                <div class="${ad.selector.replace(".", "")}"></div>
              </div>
            `);
          }
        });
      }
    });

    // 渲染完成后触发广告
    if (window.AdManager) {
      window.AdManager.renderPageAds();
    }
  }

  // ==================== 终极测试：页面加载后自动随机显示一个 search_index ====================
  function randomShowSearchIndex(containerSelector) {
    var $indexes = $(containerSelector).find(".search_index");
    if ($indexes.length === 0) {
      console.log("Not found .search_index");
      return;
    }
    $indexes.hide();
    var randomIndex = Math.floor(Math.random() * $indexes.length);
    $indexes.eq(randomIndex).show();
    console.log(
      "Automatically display:",
      containerSelector,
      "NO.",
      randomIndex + 1,
      "Count",
    );
  }

  // 页面加载后自动执行一次
  randomShowSearchIndex("#searchPage");
  randomShowSearchIndex(".searchBox02");

  // ==================== 增强：详情页 games_list 随机显示 12 条 ====================
  function randomShowDetailGames() {
    var $detailGames = $("#detailContent .games_list, .bg03 .games_list");
    if ($detailGames.length === 0) return;
    $detailGames.each(function () {
      var $ul = $(this);
      var $lis = $ul.find("li");
      if ($lis.length <= 12) return;
      var arr = $lis.toArray();
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
      $ul.empty().append(arr);
      $ul.find("li").each(function (index) {
        $(this).toggle(index < 12);
      });
    });
  }

  randomShowDetailGames();
});
