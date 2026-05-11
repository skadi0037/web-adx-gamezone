$(function () {
  $(".games h2").text(sessionStorage.getItem("category_for_nav"));
  const pageName =
    (window.location.pathname.split("/").pop() || "").replace(".html", "") ||
    sessionStorage.getItem("category_for_nav");
  const buttonText = sessionStorage.getItem("button_text_" + pageName); // 获取存储的按钮文本
  const moreBtn = $(".btn").first(); // 假设页面只有一个 More 按钮

  // 如果按钮文本存在，恢复原始文本
  if (buttonText) {
    moreBtn.text(buttonText).prop("disabled", false);
    // 清除存储的按钮文本，避免下次还恢复它
    sessionStorage.removeItem("button_text_" + pageName);
  }

  // 同样的逻辑，加载数据和处理按钮行为
  const container = $("#games_list");
  const tid =
    sessionStorage.getItem("category_tid_" + pageName) ||
    getCategoryTid(pageName);
  let currentPage = parseInt(
    sessionStorage.getItem("category_page_" + pageName) || "1",
    10,
  );

  // 检查是否有缓存数据
  const cachedData = sessionStorage.getItem("category_data_" + pageName);
  if (cachedData) {
    const list = JSON.parse(cachedData);
    if (Array.isArray(list) && list.length > 0) {
      container.empty(); // 清空静态内容
      list.forEach((g, index) =>
        appendGameItem(container, g, (categoryIndex = 1), index, "other"),
      ); // 渲染游戏数据
    }
  } else {
    // 如果没有缓存，正常加载第一页数据
    loadPage(1, true);
  }

  // 加载更多
  $(".btn").on("click", function (e) {
    e.preventDefault();
    loadPage(currentPage + 1, false); // 加载下一页并追加数据
  });

  // 请求某一页数据并渲染
  function loadPage(page, replace) {}
  // pageName -> tid 映射
  function getCategoryTid(name) {
    const map = {
      HotGames: "90",
      Puzzle: "2",
      CasualGames: "235",
      ArcadeGames: "94",
      GirlGames: "46",
      AdventureGames: "14",
      ActionGames: "91",
      SportsGames: "32",
      RacingGames: "41",
    };
    return map[name] || "2";
  }
});
