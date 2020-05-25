module.exports = {
    webpack: webpackConfig => {
        const { module = {} } = webpackConfig;

        return {
            ...webpackConfig,
            module: {
                ...module,
                rules: [
                    ...(module.rules || []),
                    {
                        test: /\.stories.yaml$/,
                        loader: require.resolve('./stories-loader')
                    }
                ]
            }
        };
    },
    managerEntries(entry = []) {
        return [...entry, require.resolve('./register')];
    }
};
