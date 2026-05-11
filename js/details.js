$(function () {
  $(function () {
    initPage();
  });

  function initPage() {
    const params = new URLSearchParams(window.location.search);
    const gid = params.get("utm_source") || params.get("gid");
    let response = JSON.parse(sessionStorage.getItem("game_detail"));

    // 校验缓存：如果缓存不存在，或者缓存的游戏 ID 与当前 URL 不符，则重新请求
    if (
      !response ||
      (gid && response.data && String(response.data.gid) !== String(gid))
    ) {
      loadPage();
    } else {
      handleData(response);
      $("#loadingMask").fadeOut(200);
    }
  }

  // 封装请求接口逻辑
  function loadPage() {
    const params = new URLSearchParams(window.location.search);
    const tid = params.get("utm_medium") || params.get("tid") || "90";
    const gid = params.get("utm_source") || params.get("gid") || "2176";

    $("#loadingMask").fadeIn(200); // 开启 loading

    $.get(baseUrl + "/glib/info", {
      tid: tid,
      gid: gid,
      _: new Date().getTime(),
    })
      .done(function (res) {
        if (res && (res.data || res.dlist)) {
          sessionStorage.setItem("game_detail", JSON.stringify(res));
          handleData(res);
        } else {
          console.warn("接口返回数据为空:", res);
        }
      })
      .fail(function (err) {
        console.error("获取数据失败：", err);
      })
      .always(function () {
        $("#loadingMask").fadeOut(200); // 无论成功失败都关闭 loading
      });
  }

  let recommendationPool = [];
  let currentRecommendationCount = 0;
  const RECOMMENDATION_PAGE_SIZE = 10;

  function handleData(response) {
    const data = response.data || {};
    const dlist = response.dlist || [];
    const imgData = data.icon || data.bannber || "./images/page.png";

    // 设置面包屑
    $("#breadcrumbCategory")
      .text(data.catename || "Category")
      .attr(
        "href",
        `./types.html?utm_medium=${data.cid}`,
      );
    $("#breadcrumbGame").text(data.name || "Game Name");

    // 设置游戏主卡片信息
    $("#gameIcon").attr("src", imgData);
    $("#gameTitle").text(data.name || "Game Name");
    // 如果接口有 tagline 可以设置，否则保留默认
    if (data.tagline) {
      $("#gameTagline").text(data.tagline);
    }

    // 设置详情描述
    $("#gameDescription").html(data.desc || "No description available.");

    // 处理描述展开/收起
    $("#showMoreDesc")
      .off("click")
      .on("click", function () {
        const $desc = $("#gameDescription");
        if ($desc.hasClass("expanded")) {
          $desc.removeClass("expanded");
          $(this).text("Show Full Description");
        } else {
          $desc.addClass("expanded");
          $(this).text("Show Less");
        }
      });

    // 准备推荐游戏数据
    recommendationPool = shuffleArray(dlist);
    currentRecommendationCount = 0;
    const $ul = $("#moreGamesList");
    $ul.empty(); // 清空旧数据

    // 初始加载
    loadMoreRecommendations();

    // 绑定加载更多按钮事件
    $("#loadMoreGamesBtn")
      .off("click")
      .on("click", function () {
        loadMoreRecommendations();
      });
  }

  function loadMoreRecommendations() {
    const $ul = $("#moreGamesList");
    const $btn = $("#loadMoreGamesBtn");

    const nextBatch = recommendationPool.slice(
      currentRecommendationCount,
      currentRecommendationCount + RECOMMENDATION_PAGE_SIZE,
    );

    if (nextBatch.length > 0) {
      nextBatch.forEach(function (game, index) {
        appendGameItem(
          $ul,
          game,
          1,
          currentRecommendationCount + index,
          "other",
        );
      });
      currentRecommendationCount += nextBatch.length;
    }

    // 如果加载完毕，隐藏按钮
    if (currentRecommendationCount >= recommendationPool.length) {
      $btn.parent().hide();
    } else {
      $btn.parent().show();
    }
  }

  function goPlayPage(e) {
    e.preventDefault();
    // 先取出 game_detail 的值
    var gameDetail = JSON.parse(sessionStorage.getItem("game_detail"));
    console.log("gameDetail", gameDetail);

    // sessionStorage.removeItem("category_for_nav");
    // sessionStorage.removeItem("category_data_Hot Games");
    // sessionStorage.removeItem("category_tid_Hot Games");
    // sessionStorage.removeItem("category_page_Hot Games");

    // 把 game_detail 放回去
    if (gameDetail !== null) {
      sessionStorage.setItem("game_detail", JSON.stringify(gameDetail));
      // 跳转到详情页
      window.location.href = "play.html";
    } else {
      showToast("Game data is loading, please wait...");
    }
  }

  //点击play按钮跳转到等待页面
  $(document).on("click", "#startPlayingBtn", function (e) {
    goPlayPage(e);
  });
});
