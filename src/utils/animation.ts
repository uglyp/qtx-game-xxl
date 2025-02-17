import gsap from 'gsap';
import CustomEase from 'gsap/CustomEase';
import { randomRange } from './random';

gsap.registerPlugin(CustomEase);

/** Unique identifiers for custom eases 针对自定义情况的唯一标识符。 
 */
let customEaseUID = 1;

/**
 * Register a custom ease curve, wrapped this way basically to prevent override accross different files 注册一个自定义平滑曲线，这样包装主要是为了防止在不同文件中被覆盖 

 * @param curve The string representing the curve 曲线 表示曲线的字符串 
 * @param name Optional name for the tween, otherwise it will create an unique id 名称 可选的补间名称，否则它将创建一个唯一的标识符 
 * @returns The ease function to be used in tweens 用于补间的缓动函数 
 */
export function registerCustomEase(curve: string, name?: string) {
    if (!name) name = 'customEase' + customEaseUID++;
    if (CustomEase.get(name)) throw new Error('Custom ease already registered: ' + name);
    return CustomEase.create(name, curve);
}

/**
 * Safely kill tweens without breaking their promises. It seems that in gsap,
 * if you kill a tween, its promises hangs forever, without either resolve or reject 安全地终止补间动画而不违背其承诺。似乎在 gsap 中，
 * 如果你终止一个补间动画，它的承诺会永远挂起，既不解决也不拒绝 
 * @param targets The tween targets that must have related tweens killed 必须杀死相关补间的补间目标 
 */
export async function resolveAndKillTweens(targets: gsap.TweenTarget) {
    const tweens = gsap.getTweensOf(targets);
    for (const tween of tweens) {
        // Force resolve tween promise, if exists 强制解决中间过渡的承诺（如果存在）
        if ((tween as any)['_prom']) (tween as any)['_prom']();
    }
    gsap.killTweensOf(targets);
}

/**
 * Pause all tweens of a target 暂停目标的所有补间动画 
 * @param targets Targets with tweens that should be paused 带有应暂停的补间的目标 
 */
export function pauseTweens(targets: gsap.TweenTarget) {
    const tweens = gsap.getTweensOf(targets);
    for (const tween of tweens) tween.pause();
}

/**
 * Resume all tweens of a target 恢复目标的所有补间动画 
 * @param targets Targets with tweens that should be resumed 具有应恢复的补间的目标 
 */
export function resumeTweens(targets: gsap.TweenTarget) {
    const tweens = gsap.getTweensOf(targets);
    for (const tween of tweens) tween.resume();
}

/**
 * Reusable shake animation, usually for shokwave/earthquake effects 可重复使用的抖动动画，通常用于冲击波/地震效果 
 * @param target The objact to 'shake' its x and y“ 摇动”其 x 和 y 的对象 
 * @param power How strong/far is the random shake 随机震动的强度/距离是多少 
 * @param duration For how long it will be shaking 它会摇晃多久 
 */
export async function earthquake(target: { x: number; y: number }, power = 8, duration = 0.5) {
    const shake = { power };
    await gsap.to(shake, {
        power: 0,
        duration,
        ease: 'linear',
        onUpdate: () => {
            if (!target) return;
            target.x = randomRange(-shake.power, shake.power);
            target.y = randomRange(-shake.power, shake.power);
        },
    });
}
