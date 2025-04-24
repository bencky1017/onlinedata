# onlinedata在线数据库

[TOC]



## 描述

在线数据库，用来测试无服务数据库功能



## 引用

### 拼音库

- 中文转拼音工具：[unpkg：pinyin-pro](https://unpkg.com/pinyin-pro@3)
- 在线工具地址：[pinyin-pro](https://pinyin-pro.cn/)

#### 参数

`pinyin(word,?option)`接受两个参数

`word`：必填，String类型，需要转化的中文。

`?option`：可选，Object类型，配置输出形式：

| 参数     | 说明                                                         | 类型    | 可选值                                 | 默认值 |
| :------- | :----------------------------------------------------------- | :------ | :------------------------------------- | :----- |
| pattern  | 输出的结果的信息（拼音 / 声母 / 韵母 / 音调 / 首字母）       | string  | pinyin / initial / final / num / first | pinyin |
| toneType | 音调输出形式(拼音符号 / 数字 / 不加音调)                     | string  | symbol / num / none                    | symbol |
| type     | 输出结果类型（字符串/数组）                                  | string  | string / array                         | string |
| multiple | 输出多音字全部拼音（仅在 word 为长度为 1 的汉字字符串时生效） | boolean | true / false                           | false  |

#### 使用方法

获取首字母

```js
console.log(pinyinPro.pinyin('张王李赵', { pattern: 'first', toneType: 'none', type: 'string' }));
// 'z w l z'
```

#### 函数

也可以自定义一个函数，专门用来获取`首字母`，方便调用：

```js
/**
 * 获取中文词语的第一个拼音字母
 *
 * @param {string} word 需要转化首字母的词语
 * @returns {string} 拼音首字母
 */
function get_first_char(word) {
    const firstWord = word[0];
    const firstChar = pinyinPro.pinyin(firstWord, { pattern: 'first', toneType: 'none', type: 'string' });
    console.log(firstChar);
    return firstChar;
}
```





### Supabase在线数据库

- 网址：[Supabase](https://supabase.com/)

#### 数据库表头

- id：条目id
- name：视频名称（主要中文）
- type：类型，主要包含：电影、电视剧、综艺
- country：国籍，（中国、韩国、美国、英国、印度……）
- initial：首字母，使用`pinyin-pro` 转化出来的拼音首字母
- watched：是否已看，默认未看0，已看1
- createtime：创建时间，格式为：`2025-4-7 09:10:09`



### 更新日志

#### v1.1.0

新功能版本，依旧使用测试数据库

> 1. 优化标题样式
> 2. 添加登录注册样式
> 3. 优化数据表中的电影名可单击全选
> 4. 新增创建记录时可选择已看状态
> 5. 优化css、js代码结构
> 6. 优化首字表的`已看`样式
> 7. 新增数据缓存功能，提升操作速度
> 8. 修复切换观看状态时，筛选状态消失的问题
> 9. 添加`shift` + `鼠标左键`批量删除功能
> 10. 优化修改记录的读取速度，添加观看状态

**下个大版本更新功能预告：**

> 1. 添加用户注册、登录功能
> 2. 优化数据表偶数斑马条纹无法显示高亮效果
> 3. 添加缓存优化



---

#### v1.0.1

优化版本，依旧使用测试数据库

> 1. `优化`版本，优化按钮功能
> 2. 修复了部分按钮点击效果
> 3. 修复多条件查找问题
>
> 2. 优化输入框组别样式
> 3. 新增`表格排序`功能，可以按照首字母升/降排序



---

#### v1.0.0

发布第一版在线数据库，使用测试数据库

更新内容：

> 1. 使用Supabase数据库
> 2. 添加影视表测试数据
> 3. 添加增删改查功能
> 4. 美化数据表显示
> 5. 新增手机端适配样式调整



