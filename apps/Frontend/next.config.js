const MangleCssClassPlugin = require("mangle-css-class-webpack-plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    API_URL: process.env.API_URL,
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.plugins.push(
        new MangleCssClassPlugin({
          classNameRegExp:
            "((hover|focus|xs|md|sm|lg|xl)[\\\\]*:)*tw-[a-z_-][a-zA-Z0-9_-]*",
          ignorePrefixRegExp: "((hover|focus|xs|md|sm|lg|xl)[\\\\]*:)*",
          log: true,
          classGenerator: (original) => {
            return btoa(original).replace(/=/g, "").slice(-7);
          },
        })
      );
    }

    return config;
  },
};

module.exports = nextConfig;
