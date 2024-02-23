Edge seeker is a fast algorithm to clamp a color into gamut.

## Features

### Follows [W3C recommendations](https://www.w3.org/TR/css-color-4/#css-gamut-mapping)

The idea of this method is the same as in the CSS Color Module Level 4: reduce chroma in OKLCH until the color is in a gamut.

### Accurate

Chroma differences in results are not noticeable.

### Gamut agnostic

Works with any RGB-based gamut. You just need to provide an RGB-to-OKLCH function.

### Fast

It works ~30x faster than binary search in detecting the maximum chroma for given luminance and hue.

It even can be used to detect out of gamut colors ~2x faster if you are working with OKLCH.

- Regular way. Convert OKLCH color to RGB and check if the values are inside the 0-1 range
- Edge seeker way. Ask the algorithm for the maximum chroma and check if the color has a lower chroma.

### Fixes OKLCH quirks

OKLCH bends space just a little too much which creates a discontinuity in the blue region for sRGB and Rec.2020. It's easy to spot when you are [looking for a pure blue](https://oklch.com/#45.201371838534286,0.31321437166460125,264.052020638055,100) (the color appears far outside gamut).

This problem causes binary search algorithms to jump over valid colors and end up with less vivid colors.

For example if we would take `#0000FF`, increase chroma and ask a binary search algorithm to clamp it we will end up with `#0031e5`.

## Concerns

It has all the same downsides as any gamut mapping algorithm that reduces chroma in an OKLCH space.

Hue lines get skewed as we go into the zone of imaginary colors. If we try to apply this algorithm to a gradient from blue to green in a CIE LCH space we will face a significant color shift.

## How it works

It uses a lookup table to estimate edges of a gamut in a hue-constant slice. Generated LUTs are pretty compact ~350 rows with 4 values are needed per gamut.

The slice of OKLCH looks almost like a triangle. If we could estimate the shape of the slice we could easily find the maximum chroma. To approximate the shape well enough we need just two values:

1. Position of the most chromatic color (the tip of the "triangle")
2. Curvature of the arc to describe the bright side of the "triangle"

Knowing these values is enough to approximate the shape:

- The dark side from 0 luminance to the most chromatic color is always a triangle by definition
- And the bright side is approximated with the arc.

## Quality Testing

To test the quality of an algorithm we can follow these steps:

1. Generate a bunch of colors on the surface of a gamut (if we use 8 bit to encode the color than there is ~390K colors on the surface)
2. Convert colors to OKLCH
3. Increase chroma and ask the algorithm to clamp a color into gamut.
4. Compare the original color and the calculated one

Ideally, we should land at the same point.
