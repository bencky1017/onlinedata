// 中文转拼音库 pinyin-pro 方法名 pinyinPro.pinyin()
// 在线数据库 Supabase 连接数据库 supabase.createClient(URL,KEY) 
const SUPABASE_URL = 'https://kdhlsnutrvlcxpnptjfp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaGxzbnV0cnZsY3hwbnB0amZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5MTIyMDEsImV4cCI6MjA1OTQ4ODIwMX0.6l5fz2xUEZoOwxTAMCmbHGvlHun_TMj_GJN8D92LUHE';
const DATABASE_TEST = 'test'    // 测试数据库
const DATABASE_VIDEO = DATABASE_TEST // 'onlineVideo'
const DATABASE_TYPE = 'videoType'
const DATABASE_COUNTRY = 'videoCountry'
const COLOR_MAP = {
    default: '#409eff', // 保持原版默认色
    success: '#67c23a',
    warning: '#e6a23c',
    error: '#f56c6c',
    info: '#409eff',
    log: '#ffffff'
}

// 提示条
let tipsElement = null; // 单例模式复用提示元素
let animationTimer = null; // 动画定时器

/**************************** ↓↓测试区域↓↓ ****************************/
// get_first_char('你是谁');
// get_first_char('kimeral')

/**************************** ↑↑测试区域↑↑ ****************************/


// 初始化 Supabase
var supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * 获取中文词语的第一个拼音字母
 *
 * @param {string} word 需要转化首字母的词语
 * @returns {string} 拼音首字母
 */
function get_first_char(word) {
    const firstWord = word[0];
    const firstChar = pinyinPro.pinyin(firstWord, { pattern: 'first', toneType: 'none', type: 'string' }).charAt(0).toUpperCase();
    return firstChar;
}

// 自动生成首字母
function autoGenerate() {
    document.getElementById('name').addEventListener('input', function () {
        var get_name = document.getElementById('name').value.trim();
        document.getElementById('initial').value = get_name ? /^[0-9a-zA-Z]$/.test(get_first_char(get_name)) ? get_first_char(get_name) : '' : '';
    });
}

// 清空输入框
function clearValue(selectors) {
    selectors.forEach(selector => {
        let processedSelector = selector;
        if (!selector.startsWith('#') && !selector.startsWith('.')) {
            processedSelector = `#${selector}`;
        }
        document.querySelectorAll(processedSelector).forEach(element => {
            if (element.type === 'checkbox') {
                element.checked = false; // 清空复选框状态
            } else {
                element.value = ''; // 清空其他输入框
            }
        });
    });
}

// 切换复选框状态
function toggleCheckbox(currentId, otherId) {
    const currentCheckbox = document.getElementById(currentId);
    const otherCheckbox = document.getElementById(otherId);
    if (currentCheckbox.checked) {
        otherCheckbox.checked = false; // 取消另一个复选框的选中状态
    }
}

/**
 * 显示提示条
 *
 * @param {string} content 需要显示的提示内容
 * @param {string} [type='default'] 提示类型（success, info, error, warning, log）
 */
function tips(content, type = 'default') {
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
            will-change: opacity;/* 启用GPU加速 */
            transition: opacity 0.2s ease-out;
        `;
        document.body.appendChild(tipsElement);
    }

    // 设置颜色（从配置表获取或使用默认值）
    const bgColor = COLOR_MAP[type] || COLOR_MAP.default;
    tipsElement.style.background = bgColor;

    // 文字颜色自动适配（浅色背景用黑色）
    if (type === 'log') {
        tipsElement.style.color = '#333333';
        tipsElement.style.border = '1px solid #aaaaaa';
    } else {
        tipsElement.style.color = 'white';
        tipsElement.style.border = 'none';
    }


    tipsElement.innerHTML = content;
    tipsElement.style.opacity = '1';
    animationTimer = setTimeout(() => {
        tipsElement.style.opacity = '0'; // 触发淡出
        animationTimer = setTimeout(() => {
            tipsElement.style.opacity = '0';// 延迟移除
        }, 800);
    }, 1200);
}

// ********************************** 页面DOM加载完成后 **********************************
document.addEventListener('DOMContentLoaded', function () {
    autoGenerate();
    getType();
    getCountry();
    showTable()
});
// **************************************************************************************


// 获取选项参数
async function getType() {
    const { data, error } = await supabase
        .from(DATABASE_TYPE)
        .select('*');
    // data = ['电影', '电视剧', '综艺'];
    var select = document.getElementById('type');
    data.forEach(item => { select.add(new Option(item.typename, item.typename)); });
}

// 获取国籍参数
async function getCountry() {
    const { data, error } = await supabase
        .from(DATABASE_COUNTRY)
        .select('*');
    // data = ['中国', '韩国', '美国', '英国', '印度'];
    var select = document.getElementById('country');
    data.forEach(item => { select.add(new Option(item.countryname, item.countryname)); });
}

// 显示记录
function displayRecords(data) {
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
                    <span class="text_content">[${item.id}] ${item.name} - ${item.type}（${item.country}）</span>
                    <small>${new Date(item.createtime).toLocaleString()}</small>
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
}

// 查询记录
async function searchItem(showTip = true) {
    const { data, error } = await supabase
        .from(DATABASE_VIDEO)
        .select('*')
        .order('id', { ascending: true });
    if (!error) {
        displayRecords(data);
        showTable(data);
        if (showTip) tips('查询成功', 'success');
    }
}

// 搜索记录
async function queryItem() {
    const id = document.getElementById('id').value;
    const name = document.getElementById('name').value.trim();
    const type = document.getElementById('type').value;
    const country = document.getElementById('country').value;
    const initial = document.getElementById('initial').value.toUpperCase();
    const watched = document.getElementById('watched').checked;
    const unwatched = document.getElementById('unwatched').checked;

    let query = supabase.from(DATABASE_VIDEO).select('*');

    const filters = [];
    if (name) {
        filters.push({ column: 'name', operator: 'ilike', value: `%${name}%` });
    }
    if (type) {
        filters.push({ column: 'type', operator: 'eq', value: type });
    }
    if (country) {
        filters.push({ column: 'country', operator: 'eq', value: country });
    }
    if (initial) {
        filters.push({ column: 'initial', operator: 'eq', value: initial });
    }
    if (watched) {
        filters.push({ column: 'watched', operator: 'eq', value: 1 });
    }
    if (unwatched) {
        filters.push({ column: 'watched', operator: 'eq', value: 0 });
    }

    filters.forEach(filter => {
        query = query.filter(filter.column, filter.operator, filter.value);
    });

    const { data, error } = await query.order('id', { ascending: true });

    if (!error) {
        displayRecords(data);
        showTable(data);
        tips('查询成功', 'success');
    } else {
        tips('查询失败', 'error');
    }
}

// 创建记录
async function createItem() {
    const name = document.getElementById('name').value.trim();
    console.log(!name)
    if (name) {
        const { data, error } = await supabase
            .from(DATABASE_VIDEO)
            .insert([{
                name: document.getElementById('name').value,
                type: document.getElementById('type').value,
                country: document.getElementById('country').value,
                initial: document.getElementById('initial').value,
                createtime: new Date().toLocaleString()
            }]);
        if (!error) {
            searchItem(false);
            tips('创建成功', 'success');
        } else {
            tips('创建失败', 'error');
        }
    } else {
        tips('名称不能为空', 'warning');
    }
    clearValue(['id', 'name', 'type', 'country', 'initial', 'watched', 'unwatched']);
}

// 修改记录
async function updateItem() {
    const id = document.getElementById('id').value;
    const name = document.getElementById('name').value;
    var modify_field = id ? 'id' : 'name';
    var modify_value = id ? id : name;

    if (modify_value) {
        // 构建确认信息
        const confirmMessage = `确定要修改这条记录吗？\n\nID： ${id || '未指定'}\n名称： ${name}`;
        const confirmUpdate = window.confirm(confirmMessage);
        if (!confirmUpdate) {
            tips('操作已取消', 'log');
            return;
        }

        const { error } = await supabase
            .from(DATABASE_VIDEO)
            .update({
                name: document.getElementById('name').value,
                type: document.getElementById('type').value,
                country: document.getElementById('country').value,
                initial: document.getElementById('initial').value,
                createtime: new Date().toLocaleString()
            })
            .eq(modify_field, modify_value);

        if (!error) {
            searchItem(false);
            tips('修改成功', 'success');
        } else {
            tips('修改失败', 'error');
        }
    } else {
        tips('ID 或 名称 不能为空', 'warning');
    }
    clearValue(['id', 'name', 'type', 'country', 'initial', 'watched', 'unwatched']);
}

// 删除记录
async function deleteItem(id = null) {
    const deleteId = id || document.getElementById('id').value;
    if (deleteId) {
        const { data, error } = await supabase
            .from(DATABASE_VIDEO)
            .select('*')
            .eq('id', deleteId)
            .single();
        if (error || !data) {
            tips('未找到对应记录', 'error');
            return;
        }
        // 构建确认信息
        const confirmMessage = `确定要删除这条记录吗？\n\nID： ${data.id}\nname： ${data.name}\ntype： ${data.type}\ncountry： ${data.country}\ninitial： ${data.initial}\ncreatetime： ${new Date(data.createtime).toLocaleString()}`;
        const confirmDelete = window.confirm(confirmMessage);
        if (!confirmDelete) {
            tips('操作已取消', 'log');
            return;
        }
        const { error: deleteError } = await supabase
            .from(DATABASE_VIDEO)
            .delete()
            .eq('id', deleteId);
        if (!deleteError) {
            searchItem(false);
            tips('删除成功', 'success');
        } else {
            tips('删除失败', 'error');
        }
    } else {
        tips('ID 不能为空', 'warning');
    }
    clearValue(['id', 'name', 'type', 'country', 'initial', 'watched', 'unwatched']);
}

// 读取记录
async function readItem(id) {
    if (id) {
        const { data, error } = await supabase
            .from(DATABASE_VIDEO)
            .select('*')
            .eq('id', id)
            .single();
        if (!error && data) {
            document.getElementById('id').value = data.id;
            document.getElementById('name').value = data.name;
            document.getElementById('type').value = data.type;
            document.getElementById('country').value = data.country;
            document.getElementById('initial').value = data.initial;
            document.getElementById('watched').checked = data.watched === 1;
            document.getElementById('unwatched').checked = data.watched === 0;
            tips('读取成功', 'success');
        } else {
            tips('读取失败', 'error');
        }
    } else {
        tips('ID 不能为空', 'warning');
    }
}

// 显示表格数据
async function showTable(data = null, ascending = null) {
    let sortColumn = 'id';
    let sortOrder = true;

    if (ascending !== null) {
        sortColumn = 'initial';
        sortOrder = ascending;
    }
    console.log(sortColumn, sortOrder)

    if (!data) {
        const response = await supabase
            .from(DATABASE_VIDEO)
            .select('*')
            .order(sortColumn, { ascending: sortOrder });
        if (response.error) {
            tips('加载表格数据失败', 'error');
            return;
        }
        data = response.data;
    }

    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';

    data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.className = item.watched ? 'watched_row' : ''; // 添加样式类
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.type}</td>
            <td>${item.country}</td>
            <td>${item.initial}</td>
            <td>
                <button class="toggle_btn ${item.watched ? 'watched' : 'unwatched'}" 
                        onclick="toggleWatched(${item.id}, ${item.watched})">
                    ${item.watched ? '标记未看' : '标记已看'}
                </button>
            </td>
            <td>${new Date(item.createtime).toLocaleString()}</td>
            <td>
                <button onclick="readItem('${item.id}')" data-button="update" >修改</button>
                <button onclick="deleteItem('${item.id}')">删除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    tips('加载表格数据成功', 'success');
}

// 添加排序控制函数
function sortTable() {
    const sortSelect = document.getElementById('sortOrder');
    const ascending = sortSelect.value === '' ? null : sortSelect.value === 'true';
    showTable(null, ascending);
}

// 切换观看状态
async function toggleWatched(id, currentStatus) {
    const { error } = await supabase
        .from(DATABASE_VIDEO)
        .update({
            watched: !currentStatus ? 1 : 0,
            createtime: new Date().toLocaleString()
        })
        .eq('id', id);

    if (!error) {
        searchItem(false);
        showTable();
        tips(`已标记为${!currentStatus ? '已看' : '未看'}`, 'success');
    } else {
        tips('状态更新失败', 'error');
    }
}

// 初始加载数据
searchItem();

