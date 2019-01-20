import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/MyRobot.ts',
  output: [
    {
      file: 'build/robot.js',
      format: 'es',
    },
  ],
  external: ['battlecode'],
  plugins: [
    typescript({
      typescript: require('typescript'),
    }),
  ],
};
