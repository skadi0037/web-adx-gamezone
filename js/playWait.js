$(function () {
  // 先取出 game_detail 的值
  const responseData = JSON.parse(sessionStorage.getItem("game_detail")) || {};
  const data = responseData.data || {};

  if (!data.name) {
    console.warn("No game data found in sessionStorage");
  }

  // 渲染游戏信息
  const imgSrc = data.icon || data.bannber || "./images/page.png";
  $(".game-icon").attr("src", imgSrc);
  $(".game-title").text(data.name || "Loading...");

  // 渲染导航栏 (如果 sessionStorage 中有数据，则渲染，否则获取)
  if (typeof loadSidebarCategories === "function") {
    loadSidebarCategories();
  }

  const progressStart = () => {
    const $progress = $(".btn-progress");
    const $btn = $(".play-btn");
    const playurl = data.playurl;
    let canPlay = false;

    // 启动平滑进度动画
    $btn.addClass("loading");
    $progress.css("width", "100%");
    $(".btn-text").text("loading...");

    // 5秒后加载完成
    setTimeout(() => {
      $btn.removeClass("loading");
      canPlay = true;
      // 可以在这里改变状态文字或者按钮样式，但原型中按钮文字一直是 GAME START
      $(".btn-text").text("GAME START");
      $(".game-status").text("Ready to play!");
    }, 5000);

    // 点击跳转逻辑
    $btn.on("click", function (e) {
      e.preventDefault();
      if (canPlay) {
        if (playurl) {
          window.location.href = playurl;
        } else {
          showToast("Play URL not found!");
        }
      } else {
        showToast("Please wait for loading...");
      }
    });
  };

  progressStart();
});
