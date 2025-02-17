import request from '../utils/request'
interface timeData {
  time: string | Number
  key: String
  pictureId: string | Number
  bookId: string | Number
}
// 结束游戏 /actGameRecord/gameOver
export async function gameOver(data: Object): Promise<any> {
    return request.post('/api/act/actGameRecord/gameOver', data);
}

// 开始游戏
export async function startGame(data: Object): Promise<any> {
    return request.post('/api/act/actGameRecord/startGame', data);
}


export async function getGameProps(data: Object): Promise<any> {
    return request.post('/api/act/actProp/list', data);
}

// 游戏翻倍
export async function doubleProp(data: Object): Promise<any> {
    return request.post('/api/act/actGameRecord/doubleProp', data);
}