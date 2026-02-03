export const isMobile = (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isLineBrowser = (): boolean => {
    return /Line/i.test(navigator.userAgent);
};
