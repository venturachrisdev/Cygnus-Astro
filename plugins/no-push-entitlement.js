/* eslint-disable import/no-extraneous-dependencies, no-param-reassign --
   @expo/config-plugins is a build-time devDependency, and mutating
   config.modResults is the standard Expo config-plugin pattern. */
const { withEntitlementsPlist } = require('@expo/config-plugins');

/* expo-notifications adds the aps-environment (remote push) entitlement during
   prebuild, but this app only uses local notifications. Remote push would
   require the Push Notifications capability on the provisioning profile, so the
   unused entitlement breaks iOS code signing. Strip it after expo-notifications
   runs (this plugin must be listed after "expo-notifications" in app.json). */
const withoutPushEntitlement = (config) =>
  withEntitlementsPlist(config, (cfg) => {
    delete cfg.modResults['aps-environment'];
    return cfg;
  });

module.exports = withoutPushEntitlement;
