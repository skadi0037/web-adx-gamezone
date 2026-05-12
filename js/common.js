// 请求基础地址
const baseUrl = "https://seevee.vip";
// const baseUrl = window.location.origin;

//清空内存数据
function ClearMemoryData() {
  sessionStorage.removeItem("game_detail");
  sessionStorage.removeItem("category_for_nav");
  sessionStorage.removeItem("category_data_Hot Games");
  sessionStorage.removeItem("category_tid_Hot Games");
  sessionStorage.removeItem("category_page_Hot Games");
  sessionStorage.removeItem("category_data_Arcade");
  sessionStorage.removeItem("category_data_Casual Games");
  sessionStorage.removeItem("category_page_Arcade Games");
  sessionStorage.removeItem("category_data_Arcade Games");
  sessionStorage.removeItem("category_page_Casual Games");
  sessionStorage.removeItem("category_tid_Arcade Games");
  sessionStorage.removeItem("category_tid_Casual Games");
}
// 打乱数组顺序 详情页面和搜索页面
function shuffleArray(arr) {
  const array = arr.slice(); // 复制一份，不修改原数组
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // 生成随机索引
    [array[i], array[j]] = [array[j], array[i]]; // 交换位置
  }
  return array;
}
// 根据移动端还是pc端控制图片的显示
function progressStart() {
  const $thumb = $(".games_list>li>a .thumb, .search_games_list>li>a .thumb");
  const $img = $(
    ".games_list>li>a .thumb>img, .search_games_list>li>a .thumb>img",
  );

  function setLayout() {
    const isMobile = $(window).width() <= 768;

    if (isMobile) {
      // 移动端保持正方形
      $thumb.css({
        "padding-bottom": "100%",
      });
      $img.css({
        top: "50%",
        left: "50%",
        width: "100%",
        height: "100%",
        "max-width": "100%",
        "max-height": "100%",
        transform: "translate(-50%, -50%)",
        "object-fit": "cover",
        "object-position": "center",
      });
    } else {
      // PC 端也改为正方形，确保与 CSS 一致
      $thumb.css({
        "padding-bottom": "100%",
      });
      $img.css({
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        position: "absolute",
        transform: "none",
        "object-fit": "cover",
        "object-position": "center",
      });
    }
  }

  // 初始化执行
  setLayout();

  // 监听窗口变化
  $(window).off("resize.progress").on("resize.progress", setLayout);
}
function getCategoryId(categoryName) {
  const categoryMap = {
    "Hot Games": "90",
    Puzzle: "2",
    "Casual Games": "235",
    "Arcade Games": "94",
    "Girl Games": "46",
    "Adventure Games": "14",
    "Action Games": "91",
    "Sports Games": "32",
    "Racing Games": "41",
  };
  return categoryMap[categoryName] || "90";
}
// 实现的功能：
// 点击侧边栏a标签，先存储数据，数据请求成功跳转，
// 通用点击处理：任何 href 以 .html 结尾的 a.btn
$(document).on("click", "a[utmMedium]", function (e) {
  // 移除其他项的高亮
  $(".cateList li a").removeClass("active");

  // 当前点击项添加高亮
  $(this).addClass("active");

  e.preventDefault();
  ClearMemoryData();
  const categoryMap = {
    "Hot Games": "90",
    Puzzle: "2",
    "Casual Games": "235",
    "Arcade Games": "94",
    "Girl Games": "46",
    "Adventure Games": "14",
    "Action Games": "91",
    "Sports Games": "32",
    "Racing Games": "41",
  };
  const $btn = $(this);
  const tid = $btn.attr("utmMedium"); // 直接取属性 41
  // 反查分类名
  const categoryName =
    Object.keys(categoryMap).find((key) => categoryMap[key] === tid) ||
    "Unknown";
  if (!tid) {
    console.warn("缺少 utmMedium 属性");
    return;
  }

  // UX：加载状态
  const originalText = $btn.text();
  // $btn.text("Loading...").prop("disabled", true);
});
// 获取当前屏幕下的列数
function getColumnCount() {
  const width = $(window).width();
  if (width > 1200) return 8;
  if (width > 992) return 6;
  if (width > 768) return 4;
  return 2;
}

//首页
function appendGameItem(
  container,
  game,
  categoryIndex,
  index,
  pageType = "other",
  tid = null,
) {
  const iconImg = game.icon || game.bannber || "./images/page.png";
  const gameTid = tid || game.cid || game.tid || "90";
  const gid = game.gid;
  const detailUrl = `games.html?utm_medium=${gameTid}&utm_source=${gid}`;

  const $card = $(`
    <li>
      <div class="game-card" onclick="window.location.href='${detailUrl}'">
        <div class="game-thumb">
          <img class="lazy" data-src="${iconImg}" src="${iconImg}" alt="${game.name || "Game"}" referrerpolicy="no-referrer">
        </div>
        <div class="game-info">
          <span>${game.name || "Game"}</span>
        </div>
      </div>
    </li>
  `);

  container.append($card);

  // 列表内广告逻辑
  if (window.AD_CONFIG && window.AD_CONFIG.global.adEnabled !== 0) {
    const currentPage = window.AdManager
      ? window.AdManager.getCurrentPage()
      : "index.html";
    const pageAds = window.AD_CONFIG.pages[currentPage] || [];

    pageAds.forEach((ad) => {
      if (ad.enabled !== 0 && typeof ad.listPosition !== "undefined") {
        // 首页：仅限第一个分类模块
        if (pageType === "home" && categoryIndex !== 0) return;

        // 核心逻辑：按照当前列数计算插入位置
        // listPosition=0 代表在第1行（所有列）后面插入
        const columnCount = getColumnCount();
        const targetIndex = (ad.listPosition + 1) * columnCount - 1;

        if (index === targetIndex) {
          container.append(`
                    <li class="ad-li ${ad.selector.replace(".", "")}">
                    </li>
                `);
        }
      }
    });
  }

  // 懒加载逻辑（这里立即触发一次）
  $(".lazy").each(function () {
    const $this = $(this);
    if ($this.attr("data-src") && !$this.attr("data-loaded")) {
      $this.attr("src", $this.attr("data-src"));
      $this.attr("data-loaded", "true"); // 防止重复加载
    }
  });
}

function showToast(message, duration = 2000) {
  // 如果已存在旧弹窗，先移除
  $(".custom-toast").remove();

  // 创建弹窗元素
  const toast = $("<div class='custom-toast'></div>").text(message);
  $("body").append(toast);
  // 动画显示
  toast.fadeIn(200);

  // 一段时间后自动隐藏
  setTimeout(() => {
    toast.fadeOut(400, () => toast.remove());
  }, duration);
}

function goToSearch(inputSelector) {
  const keyword = $(inputSelector).val().trim();
  const searchUrl =
    "https://link2.searchs-hub.com/gamesearch/" + encodeURIComponent(keyword);

  window.location.href = searchUrl;
}
//搜索页面btn点击进行搜索
$(document).on("click", "#searchBtn", function () {
  const keyword = $("#searchInput").val().trim();

  if (!keyword) {
    showToast("Please enter search content!");
    return;
  }

  goToSearch("#searchInput");
});

$(document).on("click", "#mobileSearchBtn", function () {
  const keyword = $("#mobileSearchInput").val().trim();

  if (!keyword) {
    showToast("Please enter search content!");
    return;
  }

  goToSearch("#mobileSearchInput");
});

$("#searchInput").on("keypress", function (e) {
  if (e.which === 13) {
    goToSearch("#searchInput");
  }
});

$("#mobileSearchInput").on("keypress", function (e) {
  if (e.which === 13) {
    goToSearch("#mobileSearchInput");
  }
});

//搜索框
$(document).on(
  "click",
  ".header_icon_search, .mobile-search-icon",
  function () {
    const isMobile = $(window).width() <= 768;
    let $target = $(".searchBox");

    // 如果不是移动端点击的 mobile-search-icon，则走原有的逻辑（虽然需求说pc不变，但我们最好兼容下）
    if (!$(this).hasClass("mobile-search-icon")) {
      if (typeof bg !== "undefined") {
        if (bg === "02") {
          $target = $(".searchBox02");
        } else if (bg === "03") {
          $target = $(".searchBox03");
        }
      }
    }

    if ($target.is(":visible")) {
      $("body").css("overflow", "auto");
      $target.fadeOut(300);
    } else {
      $target.fadeIn(300);
      $("body").css("overflow", "hidden"); // 移动端搜索时禁止背景滚动
    }

    // 2. 清空并填充 Hot Games 列表
    const $hotGamesList = $target.find(".games_list").first();
    $hotGamesList.empty();

    const randomCategory = JSON.parse(
      sessionStorage.getItem("randomCategory") || "{}",
    );
    if (randomCategory && randomCategory.mname) {
      const titleText =
        randomCategory.mname === "Puzzle"
          ? randomCategory.mname
          : randomCategory.mname + " Games";
      $target.find("h3").first().text(titleText);
    }

    if (randomCategory && randomCategory.dlist) {
      const dlistData = shuffleArray(randomCategory.dlist);
      dlistData.forEach(function (game, index) {
        appendGameItem($hotGamesList, game, 1, index, "other");
      });
    }
  },
);

$(document).on("click", ".closeIconSearch", function () {
  $("body").css("overflow", "auto");
  $(".searchBox, .searchBox02, .searchBox03").fadeOut(300);
});

// 动态加载侧边栏分类
function loadSidebarCategories() {
  const cachedCategories = sessionStorage.getItem("sidebar_categories");
  if (cachedCategories) {
    const categories = JSON.parse(cachedCategories);
    renderSidebar(categories);
    renderDynamicNav(categories);
  } else {
    // 如果没有缓存，则从接口获取（适用于直接进入详情页等场景）
    $.get(baseUrl + "/glib/home", { psize: 12 })
      .done(function (res) {
        if (res && res.dlist) {
          sessionStorage.setItem(
            "sidebar_categories",
            JSON.stringify(res.dlist),
          );
          renderSidebar(res.dlist);
          renderDynamicNav(res.dlist);
        }
      })
      .fail(function (err) {
        console.error("Failed to load categories for nav:", err);
      });
  }
}

function renderSidebar(categories) {
  const $sidebar = $(".sidebar");
  if ($sidebar.length === 0) return;

  // 保留 Home 链接
  const $homeLink = $('<a href="./index.html" class="sidebar-item">Home</a>');
  $sidebar.empty().append($homeLink);

  categories.forEach((category) => {
    const $item = $(`
      <a href="./types.html?utm_medium=${category.mid}" class="sidebar-item">
        ${category.mname}
      </a>
    `);
    $sidebar.append($item);
  });
}

function renderDynamicNav(categories) {
  const $mainNav = $(".main-nav");
  const $mobileNav = $(".mobile-category-nav");
  const $leftArrow = $(".left-arrow");
  const $rightArrow = $(".right-arrow");

  if ($mainNav.length > 0) {
    $mainNav.empty();
    $mainNav.append('<a href="./index.html" class="nav-item">Home</a>');
    categories.forEach((category) => {
      const $item = $(`
        <a href="./types.html?utm_medium=${category.mid}" class="nav-item">
          ${category.mname}
        </a>
      `);
      $mainNav.append($item);
    });

    // 解决 PC 端无法横向滚动的问题：监听鼠标滚轮
    $mainNav.on("wheel", function (e) {
      if (e.originalEvent.deltaY !== 0) {
        e.preventDefault();
        $(this).scrollLeft($(this).scrollLeft() + e.originalEvent.deltaY);
      }
    });

    // 处理箭头显示逻辑
    function updateArrows() {
      const scrollLeft = $mainNav.scrollLeft();
      const scrollWidth = $mainNav[0].scrollWidth;
      const clientWidth = $mainNav[0].clientWidth;
      const $container = $(".nav-container");

      // 如果内容没有溢出，隐藏两个箭头和遮罩
      if (scrollWidth <= clientWidth + 2) {
        $leftArrow.hide();
        $rightArrow.hide();
        $container.removeClass("show-left show-right");
      } else {
        // 根据滚动位置显示/隐藏箭头和遮罩
        if (scrollLeft <= 5) {
          $leftArrow.hide();
          $container.removeClass("show-left");
        } else {
          $leftArrow.css("display", "flex");
          $container.addClass("show-left");
        }

        if (scrollLeft + clientWidth >= scrollWidth - 5) {
          $rightArrow.hide();
          $container.removeClass("show-right");
        } else {
          $rightArrow.css("display", "flex");
          $container.addClass("show-right");
        }
      }
    }

    // 监听滚动和窗口变化
    $mainNav.off("scroll").on("scroll", updateArrows);
    $(window).off("resize.nav").on("resize.nav", updateArrows);

    // 点击箭头滚动
    $leftArrow.off("click").on("click", function () {
      const currentScroll = $mainNav.scrollLeft();
      $mainNav.scrollLeft(currentScroll - 200);
    });

    $rightArrow.off("click").on("click", function () {
      const currentScroll = $mainNav.scrollLeft();
      $mainNav.scrollLeft(currentScroll + 200);
    });

    // 初始调用一次
    setTimeout(updateArrows, 100);
  }

  if ($mobileNav.length > 0) {
    $mobileNav.empty();
    $mobileNav.append(
      '<a href="./index.html" class="mobile-nav-item">Home</a>',
    );
    categories.forEach((category) => {
      const $item = $(`
        <a href="./types.html?utm_medium=${category.mid}" class="mobile-nav-item">
          ${category.mname}
        </a>
      `);
      $mobileNav.append($item);
    });
  }

  // 渲染完成后更新高亮状态
  updateActiveNav();
}

function updateActiveNav() {
  const params = new URLSearchParams(window.location.search);
  const tid = params.get("utm_medium") || params.get("tid");
  const pathname = window.location.pathname;

  $(".nav-item, .mobile-nav-item").removeClass("active");

  const isHomePage =
    pathname.endsWith("index.html") ||
    pathname.endsWith("/") ||
    pathname.endsWith("index.shtml");

  if (isHomePage) {
    $(".nav-item, .mobile-nav-item").each(function () {
      const href = $(this).attr("href") || "";
      if (
        href.includes("index.html") &&
        !href.includes("tid=") &&
        !href.includes("utm_medium=")
      ) {
        $(this).addClass("active");
      } else if (href === "./" || href === "/") {
        $(this).addClass("active");
      }
    });
  } else if (tid) {
    // 遍历导航项，只通过 tid 进行匹配
    $(".nav-item, .mobile-nav-item").each(function () {
      const href = $(this).attr("href");
      if (href && (href.includes("tid=") || href.includes("utm_medium="))) {
        const url = new URL(href, window.location.origin);
        const itemTid =
          url.searchParams.get("utm_medium") || url.searchParams.get("tid");

        if (itemTid === tid) {
          $(this).addClass("active");
        }
      }
    });
  }
}

// 页面加载时处理侧边栏和导航状态
$(function () {
  updateActiveNav();

  // 尝试加载缓存的分类数据并渲染导航和侧边栏
  loadSidebarCategories();
});
