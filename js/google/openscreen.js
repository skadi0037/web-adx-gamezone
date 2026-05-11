window.googletag = window.googletag || { cmd: [] };
googletag.cmd.push(function () {
  var slot = googletag.defineOutOfPageSlot(
    "/23332244437/musikharmoni.my.id-OpenScreen",
    googletag.enums.OutOfPageFormat.INTERSTITIAL,
  );
  // Slot returns null if the page or device does not support interstitials
  if (slot) slot.addService(googletag.pubads());
  googletag.enableServices();
  // Consider delaying until first div on page
  googletag.display(slot);
});
