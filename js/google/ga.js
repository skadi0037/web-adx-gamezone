(function () {
  const GA_ID = "G-9ZDPXP0C33";

  // 动态加载 gtag.js
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  window.gtag = gtag; // 确保全局可用

  gtag("js", new Date());
  gtag("config", GA_ID);
})();
