export function userAgentIsMobile() {
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
        return true;
    }else{
        // false for not mobile device
        return false;
    }
}