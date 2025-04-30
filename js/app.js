// 中文转拼音库 pinyin-pro 方法名 pinyinPro.pinyin()
// 在线数据库 Supabase 连接数据库 supabase.createClient(URL,KEY)

// 常量定义区域
const DB_CONFIG = {
    URL: 'https://kdhlsnutrvlcxpnptjfp.supabase.co',
    KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaGxzbnV0cnZsY3hwbnB0amZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5MTIyMDEsImV4cCI6MjA1OTQ4ODIwMX0.6l5fz2xUEZoOwxTAMCmbHGvlHun_TMj_GJN8D92LUHE'
};
const TABLE = {
    TEST: 'test',
    TYPE: 'videoType',
    COUNTRY: 'videoCountry',
    VIDEO: 'test'
    // VIDEO: 'onlineVideo'
};
const CACHE_CONFIG = {
    KEY: 'bk_onlinedata_cache',
    TS_KEY: 'bk_onlinedata_cache_TS',
    EXPIRY: 60 * 60 * 1000 // 60分钟
};
const COLOR_MAP = {
    default: '#409eff', // 保持原版默认色
    success: '#67c23a',
    warning: '#e6a23c',
    error: '#f56c6c',
    info: '#409eff',
    log: '#ffffff'
};

const description = [
    '全局初始化',
    '核心功能模块',
    '通用工具方法',
    '缓存管理模块',
    '数据库操作模块',
    '主要业务模块',
    'UI更新模块',
    '辅助功能模块',
    '事件处理模块',
    '权限管理模块',
    '用户功能模块',
    '全部代码结尾'
]


// ======================== 测试区域 ========================

function test() {
    // 测试提示条
    // 延迟1秒后
    setTimeout(() => {
        tips('测试提示条default', 'default');
    }, 1000);
    setTimeout(() => {
        tips('测试提示条success', 'success');
    }, 2000);
    setTimeout(() => {
        tips('测试提示条info', 'info');
    }, 3000);
    setTimeout(() => {
        tips('测试提示条error', 'error');
    }, 4000);
    setTimeout(() => {
        tips('测试提示条warning', 'warning');
    }, 5000);
    setTimeout(() => {
        tips('测试提示条log', 'log');
    }, 6000);
}

function changeShow() {
    const debugPanel = document.querySelector('.debug_panel button[data-button="create"]');

    const tbody = document.getElementsByTagName('tbody');
    const records = document.getElementById('records');
    // 如果按钮的class包含show，则切换为hide并修改这两个显示为none，否则切换为show并修改这两个显示为block
    if (debugPanel.classList.contains('show')) {
        debugPanel.classList.remove('show');
        debugPanel.classList.add('hide');
        tbody[0].style.display = 'none';
        records.style.display = 'none';
    } else {
        debugPanel.classList.remove('hide');
        debugPanel.classList.add('show');
        tbody[0].style.display = '';
        records.style.display = 'block';
    }
}



// ======================== 全局初始化 ========================
var supabase, tipsElement, animationTimer = null;
let isShiftPressed = false;
let lastSelectedId = null;
supabase = supabase.createClient(DB_CONFIG.URL, DB_CONFIG.KEY);
// supabase.auth.onAuthStateChange(handleAuthStateChange);

tips('正在初始化加载数据...', 'info');
document.addEventListener('DOMContentLoaded', () => {
    initApplication();
});


// ======================== 核心功能模块 ========================
function initApplication() {
    // initSupabase();// 初始化 Supabase
    initEventListeners();// 初始化事件监听器
    searchItem();// 查询数据
    loadOptions();// 加载下拉选项
    initNoticeSystem(); // 加载公告
}

// ======================== 通用工具方法 ========================

// 提示条（内容，类型）： success, info, error, warning, log
/** 显示提示条
 *
 * @param {string} content 提示内容
 * @param {string} [type='default'] 类型（success, info, error, warning, log）
 */
function tips(content, type = 'default') {
    // 清除之前的提示和定时器
    if (tipsElement) {
        tipsElement.remove();
        tipsElement = null;
    }
    // 清除进行中的动画
    if (animationTimer) {
        clearTimeout(animationTimer);
        animationTimer = null;
    }
    // 复用或创建元素
    if (!tipsElement) {
        tipsElement = document.createElement('div');
        tipsElement.id = 'Tips';
        tipsElement.style.cssText = `
            position: fixed;
            left: 50%;
            transform: translateX(-50%);
            top: 27px;
            min-width: 80px;
            max-width: 300px;
            height: 50px;
            padding: 0px 20px;
            border-radius: 25px;
            border: 1px solid #eeeeee;
            z-index: 9999;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            font-family: "Microsoft YaHei";
            font-weight: bold;
            font-size: medium;
            background: #409eff;
            color: #ffffff;
            opacity: 0;
            will-change: opacity;
            transition: opacity 0.2s ease-out;
        `;
    }

    const bgColor = COLOR_MAP[type] || COLOR_MAP.default;
    tipsElement.style.background = bgColor;
    tipsElement.style.color = type === 'log' ? '#333333' : 'white';
    tipsElement.style.border = type === 'log' ? '1px solid #aaaaaa' : 'none';

    tipsElement.innerHTML = content;
    document.body.appendChild(tipsElement);

    tipsElement.style.opacity = '1';
    animationTimer = setTimeout(() => {
        tipsElement.style.opacity = '0'; // 触发淡出
        animationTimer = setTimeout(() => {
            tipsElement.remove(); // 移除元素
            tipsElement = null; // 清空引用
        }, 800);
    }, 1200);
}

// 清空输入框
function clearValue(selectors, showTip = false) {
    const defaultSelectors = [
        'id',
        'name',
        'type',
        'country',
        'initial',
        'watched',
        'unwatched',
        'sortOrder'
    ];
    const clearSelectors = selectors || defaultSelectors;
    clearSelectors.forEach(selector => {
        let processedSelector = selector;
        if (!selector.startsWith('#') && !selector.startsWith('.')) {
            processedSelector = `#${selector}`;
        }
        document.querySelectorAll(processedSelector).forEach(element => {
            if (element.type === 'checkbox') {
                element.checked = false;
            } else {
                element.value = '';
            }
        });
    });
    clearAllSelections();
    if (showTip) tips('清空成功', 'log');
}

/** 获取当前筛选条件
 * 
 * @returns {Object} 筛选条件对象
 */
function getCurrentFilters() {
    return {
        id: document.getElementById('id').value,
        name: document.getElementById('name').value.trim(),
        type: document.getElementById('type').value,
        country: document.getElementById('country').value,
        initial: document.getElementById('initial').value.trim().toUpperCase(),
        watched: document.getElementById('watched').checked,
        unwatched: document.getElementById('unwatched').checked,
        sortOrder: document.getElementById('sortOrder').value
    };
}


// ======================== 缓存管理模块 ========================


// ======================== 数据操作模块 ========================
/** 通用数据库查询方法
 * @param {Object} filters 筛选条件
 * @param {boolean} useCache 是否使用缓存
 * @returns {Promise<Array>} 查询结果
 */
async function queryDatabase(filters, useCache = true) {
    // if (useCache && isCacheValid()) {
    //     const cachedData = getCache();
    //     if (cachedData) {
    //         const filteredData = filterData(cachedData, filters);
    //         tips('使用缓存数据', 'info');
    //         return filteredData;
    //     }
    // }

    try {
        let query = buildBaseQuery(filters);
        const { data, error } = await query;
        if (error) throw error;

        // updateCache(data);
        return data;
    } catch (error) {
        tips(`查询失败: ${error.message}`, 'error');
        return [];
    }
}

/** 过滤数据库查询方法
 *
 * @param {Object} filters 添加筛选条件
 * @returns {*} Supabase查询对象
 */
function buildBaseQuery(filters) {
    let query = supabase.from(TABLE.VIDEO).select('*');

    // 添加筛选条件
    if (filters.id) query = query.eq('id', filters.id);
    if (filters.name) query = query.ilike('name', `%${filters.name}%`);
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.country) query = query.eq('country', filters.country);
    if (filters.initial) query = query.eq('initial', filters.initial);
    if (filters.watched) query = query.eq('watched', 1);
    if (filters.unwatched) query = query.eq('watched', 0);

    // 添加排序
    const sortFields = [];
    if (filters.sortOrder !== '') {
        sortFields.push({
            column: 'initial',
            ascending: filters.sortOrder === 'true'
        });
    }
    sortFields.push({ column: 'id', ascending: true });

    sortFields.forEach(sort => {
        query = query.order(sort.column, { ascending: sort.ascending });
    });

    return query;
}

// 获取表单数据
function getForm(ignore = [], inuse = []) {
    // 判断ignore或inuse是否任一一个为数组
    if (!Array.isArray(ignore) && !Array.isArray(inuse)) {
        console.error('ignore和inuse必须是数组');
        return null;
    }


    // 在ignore中添加需要忽略的字段，返回结果时候便不包含忽略的字段
    // ignore = [...ignore];
    const formData = {
        id: document.getElementById('id').value,
        name: document.getElementById('name').value.trim(),
        type: document.getElementById('type').value,
        country: document.getElementById('country').value,
        initial: document.getElementById('initial').value.trim().toUpperCase(),
        watched: document.getElementById('watched').checked ? 1 : 0,
        createtime: new Date().toLocaleString(),
        updatetime: new Date().toLocaleString()
    };
    var useData = { ...formData };

    if (inuse.length > 0) {
        // 将formData中与inuse字段相同的字段，赋值给useData
        inuse.forEach(field => {
            if (formData.hasOwnProperty(field)) {
                useData[field] = formData[field];
            }
        });
    } else {
        ignore.forEach(field => {
            if (formData.hasOwnProperty(field)) {
                delete useData[field];
            }
        });
    }
    // console.group('getFormData', formData, Object.keys(formData).length);
    // console.log('ignore:', ignore, Object.keys(ignore).length);
    // console.log('inuse:', inuse, Object.keys(inuse).length);
    // console.log('返回useData:', useData, Object.keys(useData).length)
    // console.groupEnd('getFormData');
    return useData;
}


// ======================== 主要业务模块 ========================

// 查询记录（加载）
async function searchItem(showTip = true, scroll = false, id = null) {
    // if (!(await validatePermission('read'))) return;
    tips('正在查询数据...', 'info');
    const data = await queryDatabase(getCurrentFilters());
    updateUIComponents(data);

    // 等待一帧确保DOM渲染完成
    await new Promise(resolve => requestAnimationFrame(resolve));

    if (showTip) tips('数据加载完成', 'success');
    if (scroll) {
        scrollToBottom();
        highlightNewRow(document.querySelector(`#row_${id}`));
    }
}

// 读取记录
async function readItem(id) {
    // if (!(await validatePermission('read'))) return;
    if (!id) {
        tips('ID 不能为空', 'warning');
        return;
    }
    try {
        // 优先从缓存读取
        // const cachedData = getCache();
        // if (cachedData) {
        //     const data = cachedData.find(item => item.id == id);
        //     if (data) {
        //         fillForm(data);
        //         tips('获取修改数据', 'success');
        //         return;
        //     }
        // }
        // 缓存未命中则查询数据库

        // 方法一
        const rowId = document.getElementById(`row_${id}`);
        const tds = rowId.querySelectorAll('td');
        const formFields = ['id', 'name', 'type', 'country', 'initial'];
        const isWatched = tds[5].querySelector('button').classList.contains('watched');
        formFields.forEach((field, index) => {
            document.getElementById(field).value = tds[index].innerHTML;
        });
        document.getElementById('watched').checked = isWatched;
        document.getElementById('unwatched').checked = !isWatched;


        // 方法二
        // const { data, error } = await supabase
        //     .from(TABLE.VIDEO)
        //     .select('*')
        //     .eq('id', id)
        //     .single();
        // if (error) throw error;

        // 更新本地缓存
        // const updatedCache = cachedData
        //     ? cachedData.map(item => item.id === data.id ? data : item)
        //     : [data];
        // updateCache(updatedCache);
        // fillForm(data);
        tips('读取成功', 'success');
    } catch (error) {
        tips(`读取失败: ${error.message}`, 'error');
    }
}

/* 搜索记录
async function queryItem() {
    const data = await queryDatabase(getCurrentFilters());
    updateUIComponents(data);
} */

// 创建记录
async function createItem() {
    // if (!(await validatePermission('create'))) return;

    const name = document.getElementById('name').value.trim();
    if (!name) {
        tips('名称不能为空', 'warning');
        return;
    }
    // 获取表单数据
    const newItem = getForm(['id']);
    try {
        tips('正在检查重复名称...', 'info');
        const { data: existingData, error: queryError } = await supabase
            .from(TABLE.VIDEO)
            .select('id')
            .ilike('name', name);

        if (queryError) throw queryError;

        if (existingData && existingData.length > 0) {
            tips('该名称已存在，请使用其他名称', 'error');
            return;
        }

        tips('正在创建数据...', 'info');
        const { data, error } = await supabase
            .from(TABLE.VIDEO)
            .insert([newItem])
            .select();
        if (error) throw error;
        // updateCache([...getCache(), ...data]);

        clearValue();// 必须再searchItem之前执行
        searchItem(false, true, data[0].id);// 重新加载数据
        tips('创建成功', 'success');
    } catch (error) {
        tips(`创建失败: ${error.message}`, 'error');
        console.error(error);
    }
}

// 修改记录
async function updateItem() {
    // if (!(await validatePermission('update'))) return;
    // ID和名称至少要有一个
    const id = document.getElementById('id').value;
    const name = document.getElementById('name').value.trim();
    var modify_field = id ? 'id' : 'name';
    var modify_value = id ? id : name;

    if (modify_value) {
        // 构建确认信息
        const randMsg = `${modify_field == 'id' ? 'ID：' + id : 'name：' + name}`;
        const confirmMessage = `确定要修改这条记录吗？\n\n${randMsg}`;
        const confirmUpdate = window.confirm(confirmMessage);
        if (!confirmUpdate) {
            tips('操作已取消', 'log');
            return;
        }
        // 获取表单数据，不需要 “id、创建时间”
        const getItem = getForm(['createtime']);
        tips('正在修改数据...', 'info');
        const { error } = await supabase
            .from(TABLE.VIDEO)
            .update([getItem])
            .eq(modify_field, modify_value);
        if (!error) {
            // const cachedData = getCache().map(item =>
            //     item.id === data[0].id ? data[0] : item
            // );
            // updateCache(cachedData);
            tips('修改成功', 'success');
            clearValue();
            searchItem(false);
        } else {
            tips('修改失败', 'error');
        }
    } else {
        tips('ID 或 名称 不能为空', 'warning');
    }
}

// 删除记录
async function deleteItem(id = null) {
    // if (!(await validatePermission('delete'))) return;
    // 获取当前用户角色
    // const { role } = await getCurrentUser();

    // if (role !== 'admin') {
    //     tips('权限不足，请联系管理员', 'error');
    //     return;
    // }

    try {
        const deleteId = id || document.getElementById('id').value;
        const selected = document.querySelectorAll('tr.multiple');
        if (!deleteId) {
            tips('ID 不能为空', 'warning');
            return;
        }

        // 优先处理批量删除
        if (selected.length > 0) {
            const ids = Array.from(selected).map(row => row.dataset.id);
            return batchDelete(ids);
        }

        // 确认对话框
        const confirmMessage = `确定要删除 ID 为 ${deleteId} 的记录吗？`;
        const confirmDelete = window.confirm(confirmMessage);
        if (!confirmDelete) return;
        // 执行删除
        tips('正在删除数据...', 'info');
        const { error } = await supabase
            .from(TABLE.VIDEO)
            .delete()
            .eq('id', deleteId);
        if (error) throw error;
        // 更新缓存
        // const cachedData = getCache()?.filter(item => item.id != deleteId) || [];
        // updateCache(cachedData);
        // 刷新界面
        tips('删除成功', 'success');
        clearValue();
        searchItem(false);
    } catch (error) {
        tips(`删除失败: ${error.message}`, 'error');
    }
}

// 新增批量删除方法
async function batchDelete(ids) {
    // if (!(await validatePermission('delete'))) return;
    const confirmDelete = confirm(`确定要删除选中的 ${ids.length} 条记录吗？\n\nID：[${ids.join(', ')}]`);
    if (!confirmDelete) return;

    try {
        tips('正在批量删除数据...', 'info');
        const { error } = await supabase
            .from(TABLE.VIDEO)
            .delete()
            .in('id', ids);
        if (error) throw error;
        // 更新界面
        // ids.forEach(id => {
        //     document.querySelector(`tr[data-id="${id}"]`).remove();
        // });
        tips(`成功删除 ${ids.length} 条记录`, 'success');
        searchItem(false);
    } catch (error) {
        tips(`批量删除失败: ${error.message}`, 'error');
    }
    clearAllSelections();
}

// 切换记录观看状态
async function toggleWatched(id, currentStatus) {
    tips('正在更新状态...', 'info');
    const { error } = await supabase
        .from(TABLE.VIDEO)
        .update([{
            watched: !currentStatus ? 1 : 0,
            updatetime: new Date().toLocaleString()
        }])
        .eq('id', id);

    if (!error) {
        // 获取当前筛选条件
        const data = await queryDatabase(getCurrentFilters());
        updateUIComponents(data);
        // const filters = getCurrentFilters();
        // await queryItemWithFilters(filters); // 保留当前筛选状态
        // searchItem(false);
        // updateTableDisplay();
        tips(`已标记为${!currentStatus ? '已看' : '未看'}`, 'success');
    } else {
        tips('状态更新失败', 'error');
    }
}

// 查找重复记录
async function findDuplicate() {
    tips('正在查找重复数据...', 'info');
    // 依赖于数据库函数 find_duplicates
    const { data, error } = await supabase
        .rpc('find_duplicates')
        .select('*');
    console.log('查找重复数据:', data, error);

    if (error) {
        tips('查询失败: ' + error.message, 'error');
    } else {
        if (data.length > 0) {
            tips(`找到 ${data.length} 条重复记录`, 'warning');
            updateUIComponents(data);
            // clearValue();
            // searchItem(false);
        } else {
            tips('未找到重复记录', 'success');
        }
    }
}


// ======================== UI更新模块 ========================

// 初始化事件监听器
function initEventListeners() {
    // document.querySelectorAll('[data-admin], [data-user]').forEach(el => {
    //     el.style.display = 'none';
    // });
    document.getElementById('name').addEventListener('input', handleNameInput);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Shift') isShiftPressed = true;
    });
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Shift') isShiftPressed = false;
    });

    // 表格点击处理
    document.querySelector('#dataTable tbody').addEventListener('click', handleTableClick);

    // 新建右击菜单，实现dataTable中右击后出现“取消所有选择”功能
    document.addEventListener('contextmenu', (e) => {
        if (e.target.closest('#dataTable tbody')) {
            e.preventDefault();

            // 清除现有的上下文菜单
            const existingMenu = document.getElementById('contextMenu');
            if (existingMenu) existingMenu.remove();

            // 创建新的上下文菜单
            const contextMenu = document.createElement('div');
            contextMenu.id = 'contextMenu';
            contextMenu.innerHTML = `<button onclick="clearAllSelections(); document.getElementById('contextMenu').remove();">取消所有选择</button>`;
            contextMenu.style.position = 'absolute';
            contextMenu.style.left = `${e.pageX}px`;
            contextMenu.style.top = `${e.pageY}px`;
            document.body.appendChild(contextMenu);

            // 点击其他地方时清除菜单
            document.addEventListener('click', function handleClickOutside(event) {
                if (!contextMenu.contains(event.target)) {
                    contextMenu.remove();
                    document.removeEventListener('click', handleClickOutside);
                }
                tips('取消所有选择', 'log');
            });

            // 按下其他按键时清除菜单
            document.addEventListener('keydown', function handleKeyDown() {
                contextMenu.remove();
                document.removeEventListener('keydown', handleKeyDown);
                tips('取消所有选择', 'log');
            });
        }
    });
}

// 更新UI组件
function updateUIComponents(data) {
    updateRecordsDisplay(data);
    updateTableDisplay(data);
    updateCountDisplay(data);
}

// 更新表格显示
async function updateTableDisplay(data = null) {
    // if (!data) {
    //     data = getCache() || [];
    //     if (data.length === 0) {
    //         const response = await supabase.from(TABLE.VIDEO).select('*');
    //         data = response.data || [];
    //     }
    // }

    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';
    data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.id = `row_${item.id}`;
        row.dataset.id = item.id;  // 用来多选
        row.className = item.watched ? 'watched_row' : ''; // 添加样式类
        row.innerHTML = `
            <td>${item.id}</td>
            <td class="canSelect">${item.name}</td>
            <td>${item.type}</td>
            <td>${item.country}</td>
            <td>${item.initial}</td>
            <td>
                <button class="toggle_btn ${item.watched ? 'watched' : 'unwatched'}" 
                        onclick="toggleWatched(${item.id}, ${item.watched})">
                    ${item.watched ? '标记未看' : '标记已看'}
                </button>
            </td>
            <!-- <td>${new Date(item.createtime).toLocaleString()}</td> -->
            <td>${item.updatetime = null ? '-' : new Date(item.updatetime).toLocaleString()}</td>
            <td>
                <button onclick="readItem('${item.id}')" data-button="update" >修改</button>
                <button onclick="deleteItem('${item.id}')">删除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    tips('加载表格数据成功', 'success');
}

// 更新记录显示
function updateRecordsDisplay(data) {
    const grouped = data.reduce((acc, item) => {
        const letter = item.initial;
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(item);
        return acc;
    }, {});

    if (!data || data.length === 0) {
        document.getElementById('records').innerHTML = '<p class="no_data">未搜索到任何数据</p>';
        return;
    }

    const html = Object.keys(grouped).sort().map(letter => `
        <div class="letter_group">
            <h3>${letter}</h3>
            ${grouped[letter].map(item => `
                <div class="${item.watched ? 'watched_item' : ''}">
                    <span class="text_content">[${item.id}]&nbsp;</span>
                    <span class="text_content canSelect">${item.name}</span>
                    <span class="text_content">&nbsp;- ${item.type}（${item.country}）</span>
                    <!-- <small>${new Date(item.createtime).toLocaleString()}</small> -->
                    <small></small>
                    <button class="toggle_btn ${item.watched ? 'watched' : 'unwatched'}" 
                            onclick="toggleWatched(${item.id}, ${item.watched})">
                        ${item.watched ? '标记未看' : '标记已看'}
                    </button>
                    <button data-button="delete" onclick="deleteItem('${item.id}')">删除</button>
                    <!-- 后续添加 -->
                </div>
            `).join('')}
        </div>
    `).join('');

    document.getElementById('records').innerHTML = html;
    updateCountDisplay(data);
}

// 更新记录数显示
function updateCountDisplay(data) {
    document.getElementById('totalCount').textContent = data.length;
}

// 更新删除数显示
function updateDeleteDisplay(data = null) {
    document.getElementById('deletedCount').textContent = data
        || document.querySelectorAll('tr.multiple').length;
}

// 填充表单字段
function fillForm(data) {
    document.getElementById('id').value = data.id;
    document.getElementById('name').value = data.name;
    document.getElementById('type').value = data.type;
    document.getElementById('country').value = data.country;
    document.getElementById('initial').value = data.initial;
    document.getElementById('watched').checked = data.watched === 1;
    document.getElementById('unwatched').checked = data.watched === 0;
}

// 高亮效果函数
function highlightNewRow(row) {
    if (!row) return;
    // 先移除可能存在的旧动画
    row.classList.remove('new_row_flash');
    // 触发重新渲染
    void row.offsetWidth;
    row.classList.add('new_row_flash');
    setTimeout(() => {
        row.classList.remove('new_row_flash');
    }, 2000);
}

// 处理关闭模态框事件
function closeModal(event) {
    const modal = event.target.closest('.modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 加载公告
function initNoticeSystem() {
    const popup = document.querySelector('.notice_popup');
    const trigger = document.querySelector('.notice_trigger');
    const closeBtn = document.querySelector('.notice_close');

    // 打开弹窗
    trigger.addEventListener('click', async () => {
        try {
            const response = await fetch('./js/notice.json');
            const data = await response.json();
            renderNoticeContent(data);
            popup.classList.add('active');
        } catch (error) {
            console.error('公告加载失败:', error);
            popup.classList.add('active');
            renderErrorContent();
        }
    });

    // 关闭弹窗
    function closePopup() {
        popup.classList.remove('active');
    }

    closeBtn.addEventListener('click', closePopup);
    popup.querySelector('.notice_mask').addEventListener('click', closePopup);
}

// 渲染公告内容
function renderNoticeContent(data) {
    const content = document.querySelector('.notice_content');

    content.innerHTML = `
        <div class="notice_section">
        <h4 class="section_title">🎉 最新公告</h4>
        <ul class="notice_list">
            ${data.notices.map(n => `<li class="notice_item">${n}</li>`).join('')}
        </ul>
        </div>
        
        <div class="notice_section">
        <h4 class="section_title">✨ 版本更新</h4>
        <div class="update_list">
            ${data.updates.map(update => `
            <div class="update_item">
                <div class="version_header">
                <span class="version_tag">${update.version}</span>
                <span class="version_date">${update.date}</span>
                </div>
                <ul class="feature_list">
                ${update.features.map(f => `<li class="feature_item">${f}</li>`).join('')}
                </ul>
            </div>
            `).join('')}
        </div>
        </div>
    `;
}

// 渲染错误状态
function renderErrorContent() {
    document.querySelector('.notice_content').innerHTML = `
        <div class="notice_error">
        <p>⚠️ 公告内容加载失败，请稍后再试</p>
        <button onclick="location.reload()">刷新页面</button>
        </div>
    `;
}


// ========================= 用户登录模块 ========================

// 处理登录和注册操作
function handleAuth(action) {
    // 后续可对接Supabase认证
    const authType = {
        login: handleLogin,
        register: handleRegister
    };

    if (authType[action]) {
        authType[action]();
    } else {
        tips('未知操作类型', 'error');
    }
}

// 处理登录按钮点击事件
function submitLogin() {
    tips('登录功能待开发...', 'warning');
    // const loginBtn = document.getElementById('loginBtn');
    // if (loginBtn) {
    //     loginBtn.addEventListener('click', handleLogin);
    // }
}

// 处理注册按钮点击事件
function submitRegister() {
    tips('注册功能待开发...', 'warning');
    // const registerBtn = document.getElementById('registerBtn');
    // if (registerBtn) {
    //     registerBtn.addEventListener('click', handleRegister);
    // }
}


// 登录函数
async function handleLogin() {
    const registerModal = document.getElementById('registerModal');
    if (registerModal) {
        registerModal.style.display = 'none';
    }
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.style.display = 'block';
    }
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();


    if (!email || !password) return;

    // const { data, error } = await supabase.auth.signInWithPassword({
    //     email,
    //     password
    // });

    console.log('email:', email, 'password:', password);

    if (error) {
        tips('登录失败: ' + error.message, 'error');
    } else {
        tips('登录成功', 'success');
    }
}

// 注册函数
async function handleRegister() {
    const registerModal = document.getElementById('registerModal');
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.style.display = 'none';
    }
    if (registerModal) {
        registerModal.style.display = 'block';
    }
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    if (!email || !password) return;

    if (password.length < 6) {
        tips('密码至少需要6位', 'warning');
        return;
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                role: 'user'
            }
        }
    });

    if (error) {
        tips('注册失败: ' + error.message, 'error');
    } else {
        // 自动创建用户资料
        await supabase
            .from('user_profiles')
            .insert([{
                user_id: data.user.id,
                role: 'user'
            }]);
        tips('注册成功，请查收验证邮件', 'success');
    }
}





// ======================== 辅助功能模块 ========================

// 加载下拉选项
async function loadOptions() {
    await loadTypeOptions();
    await loadCountryOptions();
}

// 加载类型选项
async function loadTypeOptions() {
    const { data } = await supabase.from(TABLE.TYPE).select('*');
    populateSelect('type', data, 'typename');
}

// 加载国家选项
async function loadCountryOptions() {
    const { data } = await supabase.from(TABLE.COUNTRY).select('*');
    populateSelect('country', data, 'countryname');
}

// 填充下拉列表
function populateSelect(selectId, data, valueField) {
    const select = document.getElementById(selectId);
    data.forEach(item => select.add(new Option(item[valueField], item[valueField])));
}

// 切换复选框状态
function toggleCheckbox(currentId, otherId) {
    const currentCheckbox = document.getElementById(currentId);
    const otherCheckbox = document.getElementById(otherId);
    if (currentCheckbox.checked) {
        otherCheckbox.checked = false; // 取消另一个复选框的选中状态
    }
    // 立即执行查询
    // searchItem(false);
}

// 切换排序状态
async function sortTable() {
    const sortSelect = document.getElementById('sortOrder');
    const ascending = sortSelect.value === '' ? null : sortSelect.value;

    // const cachedData = getCache();
    // if (cachedData) {
    //     updateTableDisplay(cachedData, ascending);
    // } else {
    //     updateTableDisplay(null, ascending);
    // }

    const filters = getCurrentFilters();
    const data = await queryDatabase(filters, false);
    updateTableDisplay(data, ascending);
    updateCountDisplay(data);
    updateDeleteDisplay(0);
}

// 滚动到底部
function scrollToBottom() {
    const tableBody = document.querySelector('.dataTable');
    tableBody.scrollTo({
        top: tableBody.scrollHeight,
        behavior: 'smooth'
    });

    // 如果指定了行ID，则滚动到该行
    // const container = document.querySelector('.dataTable');
    // const rowTop = row.offsetTop;
    // const rowHeight = row.offsetHeight;
    // const containerHeight = container.offsetHeight;

    // container.scrollTo({
    //     top: rowTop - containerHeight + rowHeight + 20, // 加20像素缓冲
    //     behavior: 'smooth'
    // });
}



// ======================== 事件处理模块 ========================

// 处理名称输入事件
function handleNameInput() {
    const name = this.value.trim();
    document.getElementById('initial').value =
        /^[0-9a-zA-Z]+$/.test(getFirstChar(name)) ?
            getFirstChar(name) : '';
}

// 获取拼音首字母
function getFirstChar(word) {
    return word ? pinyinPro.pinyin(word[0], {
        pattern: 'first',
        toneType: 'none',
        type: 'string'
    }).charAt(0).toUpperCase() : '';
}

// 新增行处理
function handleTableClick(e) {
    const targetRow = e.target.closest('tr');
    if (!targetRow || !targetRow.dataset.id) return;
    if (e.target.tagName === 'BUTTON') return;
    // 当前点击的ID
    const currentId = targetRow.dataset.id;
    const wasSelected = targetRow.classList.contains('multiple');
    // 处理行点击事件
    if (isShiftPressed && lastSelectedId) {
        handleShiftSelection(targetRow, currentId, wasSelected);
    } else {
        handleSingleSelection(targetRow, currentId, wasSelected);
    }
    lastSelectedId = currentId;
}

// 单选模式
function handleSingleSelection(row, id, wasSelected) {
    if (wasSelected) {
        // 点击已选中行：取消选择
        row.classList.remove('multiple');
    } else {
        // 清除所有选择后选中当前行
        clearAllSelections();
        row.classList.add('multiple');
    }
    updateDeleteDisplay();
}

// Shift多选模式
function handleShiftSelection(targetRow, currentId, wasSelected) {
    const rows = Array.from(document.querySelectorAll('#dataTable tr[data-id]'));
    const startIndex = rows.findIndex(r => r.dataset.id === lastSelectedId);
    const endIndex = rows.findIndex(r => r.dataset.id === currentId);
    // 确定选区范围
    const [start, end] = [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)];
    // 批量标记选区
    rows.slice(start, end + 1).forEach(row => {
        // row.classList.add('multiple');
        const shouldSelect = !wasSelected || row !== targetRow;
        row.classList.toggle('multiple', shouldSelect);
    });
    updateDeleteDisplay();
}

// 清除所有选中行
function clearAllSelections() {
    document.querySelectorAll('tr.multiple').forEach(row => {
        row.classList.remove('multiple');
    });
    // 清空所有选中行
    updateDeleteDisplay(0);
}



// ======================== 权限管理模块 ========================


// ======================== 全部代码结尾 ========================

