import * as compress_images from 'compress-images';

export async function compressImage(
  input: string,
  output: string,
): Promise<any> {
  return new Promise((resolve, reject) => {
    compress_images(
      input,
      output,
      { compress_force: false, statistic: true, autoupdate: true },
      false,
      { jpg: { engine: 'mozjpeg', command: ['-quality', '20'] } },
      { png: { engine: 'pngquant', command: ['--quality=20-20', '-o'] } },
      { svg: { engine: 'svgo', command: '--multipass' } },
      {
        gif: {
          engine: 'gifsicle',
          command: ['--colors', '64', '--use-col=web'],
        },
      },
      (error: any, completed: any, statistic: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(completed);
        }
      },
    );
  });
}
