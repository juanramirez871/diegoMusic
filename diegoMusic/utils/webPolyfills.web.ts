if (typeof HTMLElement !== 'undefined' && !('setNativeProps' in HTMLElement.prototype)) {
  (HTMLElement.prototype as any).setNativeProps = function () {};
}

export {};
