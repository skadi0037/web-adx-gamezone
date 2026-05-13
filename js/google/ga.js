(function () {
  const configUrl = (function () {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src.includes("ga.js")) {
        var path = scripts[i].src.split("?")[0];
        return path.substring(0, path.lastIndexOf("/") + 1) + "ad-config.json";
      }
    }
    return "./js/google/ad-config.json";
  })();

  async function initGA() {
    try {
      let config = window.AD_CONFIG;
      if (!config) {
        const response = await fetch(configUrl + "?v=" + new Date().getTime());
        if (!response.ok) throw new Error("Failed to load ad-config.json");
        config = await response.json();
      }

      const GA_ID = config.global.gaId;
      if (!GA_ID) return;

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
    } catch (error) {
      console.error("GA Init Error:", error);
    }
  }

  initGA();
})();
