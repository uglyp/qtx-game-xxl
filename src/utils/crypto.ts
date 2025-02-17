import * as CryptoJS from 'crypto-js';

// AES密钥，应该是一个16、24或32字节的字符串
const key = '6d8dTGdl0djad7HJ';

// IV（初始向量），也应该是16字节的字符串
export const iv = '1234567890123456';

// 加密数据
export function encrypt(data) {
    let cipherText = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return cipherText.toString();
}

// 调用加密函数
// var encryptedData = encrypt(data, key, iv);
// console.log('加密数据:', encryptedData);
