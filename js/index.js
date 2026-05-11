$(document).ready(function () {
  //页面进来隐私政策和使用条款不显示
  $("#privacy, #Terms").hide();

  // 回到顶部功能：监听页面滚动条
  $(window).scroll(function () {
    if ($(this).scrollTop() > 10) {
      // 滚动高度大于10px时显示按钮
      $(".top_lea").fadeIn();
    } else {
      $(".top_lea").fadeOut();
    }
  });

  // 点击回到顶部
  $(".top_lea").click(function () {
    $("html, body").animate({ scrollTop: 0 }, 500); // 500ms平滑滚动到顶部
  });

  function showSection(sectionId) {
    // 隐藏所有主要区块
    $("#main, #privacy, #Terms").hide();
    // 显示目标部分
    $("#" + sectionId).fadeIn(300);
    // 平滑回顶部
    $("html, body").animate({ scrollTop: 0 }, 500);
  }

  //点击logo图片显示主页内容
  $(document).on("click", ".header_logo", function () {
    ClearMemoryData(); //清空内存数据 game_detail//条码详情 randomCategory//搜索页面列表
    showSection("main");
  });

  // Transform old structure to new structure (Disabled as we use new grid)
  window.initSliders = function () {
    // Logic moved to main.js renderHomePage
  };

  window.initSliders();

  // Sidebar toggle (Disabled as we use top nav)
  /*
  $(".sidebar-toggle").click(function () {
    if ($(window).width() <= 768) {
      $(".sidebar").toggleClass("active");
    } else {
      $(".sidebar").toggleClass("collapsed");
    }
  });
  */

  // Close sidebar when clicking outside on mobile
  $(document).click(function (event) {
    if ($(window).width() <= 768) {
      if (!$(event.target).closest(".sidebar, .sidebar-toggle").length) {
        $(".sidebar").removeClass("active");
      }
    }
  });

  //分类跳转显示 (Legacy support for old header icons if they exist)
  $(".header_icon").click(function () {
    let $target = "";
    if (bg === "02") {
      $target = $(".categoryBox02");
    } else if (bg === "01") {
      $target = $(".categoryBox");
    } else {
      $target = $(".categoryBox03");
    }
    if ($target.is(":visible")) {
      $("body").css("overflow", "auto");
      $target.fadeOut(300);
    } else {
      $target.fadeIn(300);
      $("body").css("overflow", "hidden");
    }
  });

  $(".closeIcon,.homeImg").click(function () {
    if (bg === "01") {
      $(".categoryBox").fadeOut(300);
    }
    $("body").css("overflow", "auto");
  });
});
