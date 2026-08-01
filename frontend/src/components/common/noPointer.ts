/**
 * `pointerEvents: 'none'` as a style entry.
 *
 * react-native-web deprecated the `pointerEvents` *prop* in favour of the style
 * property, and warns once per render for every component still using it. The
 * app has a lot of decorative overlays — scrims, glares, glows, noise, spark
 * dots — so this is shared rather than repeated at each call site.
 */
export const noPointer = { pointerEvents: 'none' } as const;
