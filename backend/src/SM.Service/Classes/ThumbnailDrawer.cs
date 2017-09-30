﻿using System.Threading.Tasks;
using Proto;
using SkiaSharp;
using SM.Core.Model;

namespace SM.Service.Classes
{
    public class ThumbnailDrawer : IActor
    {
        public Task ReceiveAsync(IContext context)
        {
            if (context.Message is PatternState state)
            {
                const int stitchSize = 2;
                using (var surface = SKSurface.Create((int) state.Width * stitchSize, (int) state.Height * stitchSize,
                    SKImageInfo.PlatformColorType, SKAlphaType.Premul))
                {
                    foreach (var stitch in state.Stitches)
                    {
                        var configuration = state.Configurations[stitch.ConfigurationIndex];
                        var paint = new SKPaint {Color = SKColor.Parse(configuration.HexColor)};
                        var rect = new SKRect
                        {
                            Left = stitch.Point.X * stitchSize,
                            Top = stitch.Point.Y * stitchSize,
                            Right = (stitch.Point.X + 1) * stitchSize,
                            Bottom = (stitch.Point.Y + 1) * stitchSize
                        };
                        surface.Canvas.DrawRect(rect, paint);
                    }
                    context.Parent.Tell(new Thumbnail
                    {
                        Image = surface.Snapshot().Encode(SKEncodedImageFormat.Png, 100).ToArray()
                    });
                }
            }
            return Actor.Done;
        }
    }
}
