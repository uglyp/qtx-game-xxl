   
import { navigation } from '../utils/navigation';
import { Toast } from '../ui/Toast';
import { getUrlParam } from '../utils/getUrlParams';

export const isQtx = getUrlParam('channel') === 'qtx'
export const isQdMetro = getUrlParam('channel') === 'qdmetro';
const ua = navigator.userAgent || '';
export const isWechat = /micromessenger\/([\d.]+)/i.test(ua);
export const isIos = /iphone|ipod/i.test(ua);

   export function jump(){
        if (isWechat) {
            // ts-ignore
            wx.miniProgram.redirectTo({
                url: '/pages/matchGameIndex/matchGameIndex', // id:所需参数（动态参数需放在引号外小程序才可识别）
                success: (res) => {
                    console.log(res); // 页面跳转成功的回调函数
                },
                fail: (err) => {
                    console.log(err); // 页面跳转失败的回调函数
                },
            });
        } else {
            window.history.go(-1);
        }
    }
    export function errorRemind(code){
        switch (code) {
            case '03':
            case '02':
            case '20':
                localStorage.setItem('codeMessage', '服务器开小差了，稍后再试吧');
            case '05':
                localStorage.setItem('codeMessage', '您未参与本期活动哦');
            case '513':
                localStorage.setItem('codeMessage', '游戏次数或翻倍卡不足 去做任务获取吧');
            case '514':
                localStorage.setItem('codeMessage', '本期活动已结束');
            case '0001':
                localStorage.setItem('codeMessage', '游戏结算中，请稍等');
        }
        navigation.presentPopup(Toast);
        setTimeout(() => {
            navigation.dismissPopup();
        }, 1500);

    }

    export function getStatusBarHeight() {
        if (isQtx) {
            return 40
        }
        return 0
    }

