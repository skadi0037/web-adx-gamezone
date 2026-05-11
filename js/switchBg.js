/**
 * 主题切换功能
 */

function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else if (theme === "pink") {
    document.documentElement.setAttribute("data-theme", "pink");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }

  // 同步自定义下拉框
  const $trigger = $(".theme-select-trigger");
  const $options = $(".theme-option");
  const themeName = theme.charAt(0).toUpperCase() + theme.slice(1);

  $trigger.text(themeName);
  $options.removeClass("selected");
  $(`.theme-option[data-value="${theme}"]`).addClass("selected");

  // 持久化
  localStorage.setItem("app-theme", theme);
}

$(function () {
  // 初始化主题 (默认为 dark，根据 PRD 要求)
  const savedTheme = localStorage.getItem("app-theme") || "dark";
  applyTheme(savedTheme);

  // 绑定自定义下拉框点击事件
  $(document).on("click", ".theme-select-trigger", function (e) {
    e.stopPropagation();
    $(this).toggleClass("active");
  });

  // 绑定选项点击事件
  $(document).on("click", ".theme-option", function (e) {
    e.stopPropagation();
    const selectedTheme = $(this).data("value");
    applyTheme(selectedTheme);
    $(".theme-select-trigger").removeClass("active");
  });

  // 点击外部关闭下拉框
  $(document).on("click", function () {
    $(".theme-select-trigger").removeClass("active");
  });
});
