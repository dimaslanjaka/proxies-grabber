export default {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' },
        modules: false // keep ESM
      }
    ],
    '@babel/preset-typescript'
  ]
};
