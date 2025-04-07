const SUPABASE_URL = 'https://kdhlsnutrvlcxpnptjfp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaGxzbnV0cnZsY3hwbnB0amZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5MTIyMDEsImV4cCI6MjA1OTQ4ODIwMX0.6l5fz2xUEZoOwxTAMCmbHGvlHun_TMj_GJN8D92LUHE';

const DATABASE = 'test'

// 初始化 Supabase
var supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 获取任务列表
async function loadTasks() {
    const { data, error } = await supabase.from(DATABASE).select('*');
    console.log(JSON.parse(JSON.stringify(data)))
    if (error) console.error(error);
    else renderTasks(data);
}

// 添加任务
document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const taskInput = document.getElementById('taskInput');
    const { error } = await supabase.from(DATABASE).insert([{ username: taskInput.value }]);
    if (error) {
        alert('添加失败');
        console.log(error)
    }
    else {
        taskInput.value = '';
        loadTasks();
    }
});

// 渲染任务到页面
function renderTasks(tasks) {
    const list = document.getElementById('taskList');
    list.innerHTML = tasks.map(task => `
    <li>
      ${task.username}
      <button onclick="deleteTask('${task.id}')">删除</button>
    </li>
  `).join('');
}

// 删除任务
window.deleteTask = async (id) => {
    console.log(id)
    const { error } = await supabase.from(DATABASE).delete().eq('id', id);
    if (error) alert('删除失败');
    else loadTasks();
};

// 初始化加载任务
loadTasks();