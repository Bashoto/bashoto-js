/*global initBashotoCore initBashotoTopic initBashotoLeaderboard*/
var initBashoto = function (context) {

  initBashotoCore(context);
  initBashotoTopic(context);
  initBashotoLeaderboard(context);

  return context.Bashoto;
};


if (typeof define === 'function' && define.amd) {
  // Expose Library as an AMD module if it's loaded with RequireJS or
  // similar.
  define(function () {
    return initBashoto({});
  });
} else {
  // Load Library normally (creating a Library global) if not using an AMD
  // loader.
  initBashoto(this);
}
