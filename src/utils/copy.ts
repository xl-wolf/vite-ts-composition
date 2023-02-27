/**
 * 判断对象是否为数组
 */
const isArray = Array.isArray

/**
 * 对象深拷贝
 * @param tSource
 * @returns
 */
export const deepClone = <T>(tSource: T, tTarget?: Record<string, any> | T): T => {
    if (isArray(tSource)) {
        tTarget = tTarget || [];
    } else {
        tTarget = tTarget || {};
    }
    for (const key in tSource) {
        if (Object.prototype.hasOwnProperty.call(tSource, key)) {
            if (typeof tSource[key] === "object" && typeof tSource[key] !== null) {
                tTarget[key] = isArray(tSource[key]) ? [] : {};
                deepClone(tSource[key], tTarget[key]);
            } else {
                tTarget[key] = tSource[key];
            }
        }
    }
    return tTarget as T;
}

/**
 * 对象浅拷贝
 * @param tSource
 * @returns
 */
export const simpleClone = <T>(tSource: T, tTarget?: Record<string, any> | T): T => {
    if (isArray(tSource)) {
        tTarget = tTarget || [];
    } else {
        tTarget = tTarget || {};
    }
    for (const key in tSource) {
        if (Object.prototype.hasOwnProperty.call(tSource, key)) {
            tTarget[key] = tSource[key];
        }
    }
    return tTarget as T;
}
