<template>
  <div>
    <a-avatar class="user-avatar" @click="showModal" :src="user.userAvatar">U</a-avatar>

    <div class="search-container">
      <a-input-search v-model:value="searchParams.searchText" placeholder="input search text" enter-button="Search"
        size="large" @search="onSearch" @input="handleSearch" />
      <div v-if="suggestions.length > 0" class="suggestion-container">
        <div v-for="item in suggestions" :key="item" class="suggestion-item" @click="onSelect(item)">
          {{ item }}
        </div>
      </div>
    </div>

    <MyDivider />
    <a-tabs v-model:activeKey="activeKey" @change="onTabChange">
      <a-tab-pane key="post" tab="文章">
        <PostList :post-list="postList" />
      </a-tab-pane>
      <a-tab-pane key="picture" tab="图片">
        <PictureList :picture-list="pictureList" />
      </a-tab-pane>
      <a-tab-pane key="user" tab="用户">
        <UserList :user-list="userList" />
      </a-tab-pane>
    </a-tabs>
    <a-pagination v-model:current="searchParams.pageNum" :total="total" :pageSize="searchParams.pageSize"
      show-less-items @change="onPageChange" />

    <!-- 登录注册Modal -->
    <a-modal v-model:visible="isModalVisible" title="登录/注册" @ok="handleOk" @cancel="handleCancel">
      <a-form :model="user" :rules="rules" ref="formRef">
        <a-form-item label="账号" name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
          <a-input v-model:value="user.userAccount" />
        </a-form-item>
        <a-form-item label="密码" name="userPassword" :rules="[{ required: true, message: '请输入密码' }]">
          <a-input-password v-model:value="user.userPassword" />
        </a-form-item>
        <template v-if="isRegistering">
          <a-form-item label="确认密码" name="checkPassword" :rules="[{ required: true, message: '请确认密码' }]">
            <a-input-password v-model:value="user.checkPassword" />
          </a-form-item>
        </template>
        <a-form-item>
          <a-checkbox v-model:checked="isRegistering">注册</a-checkbox>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 更新用户信息Modal -->
    <a-modal v-model:visible="isUpdateVisible" title="个人信息" @ok="handleUpdate" @cancel="handleCancelUpdate"
      :ok-text="'更新'">
      <template #footer>
        <a-button key="logout" @click="handleLogout">登出</a-button>
        <a-button key="submit" type="primary" @click="handleUpdate">更新</a-button>
      </template>

      <a-form :model="user" ref="formRef">
        <a-form-item label="用户名" name="userName">
          <a-input v-model:value="user.userName" />
        </a-form-item>
        <a-form-item label="头像" name="userAvatar">
          <a-upload :custom-request="uploadFile" list-type="picture-card"
              :file-list="fileList" @preview="previewVisible = true" @change="handleChange">
              <div v-if="fileList.length < 1">
                <a-icon type="plus" />
                <div class="ant-upload-text">
                  Upload
                </div>
              </div>
            </a-upload>
            <a-modal :visible="previewVisible" :footer="null" @cancel="previewVisible = false">
              <img alt="example" style="width: 100%" :src="user.userAvatar" />
            </a-modal>
        </a-form-item>
        <a-form-item label="个人简介" name="userProfile">
          <a-textarea placeholder="请输入个人简介" v-model:value="user.userProfile" :auto-size="{ minRows: 2, maxRows: 6 }" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import PostList from '@/components/PostList.vue';
import PictureList from '@/components/PictureList.vue';
import UserList from '@/components/UserList.vue';
import MyDivider from '@/components/MyDivider.vue';
import { useRoute, useRouter } from 'vue-router';
import myAxios from '@/plugins/myAxios';
import { message, Form, Upload, AutoComplete, Input, Avatar, Modal, Select } from 'ant-design-vue';

const user = ref({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
  userName: '',
  userAvatar: '',
  userProfile: '',
});

const postList = ref([]);
const pictureList = ref([]);
const userList = ref([]);
const total = ref(0); // 总记录数
const route = useRoute();
const router = useRouter();
const activeKey = ref(route.params.category || 'post');
const searchParams = ref({
  searchText: route.query.searchText || '',
  pageNum: 1,
  pageSize: 8,
});
const suggestions = ref([]); // 用于存储联想词
const isModalVisible = ref(false);
const isUpdateVisible = ref(false);
const isRegistering = ref(false);
const previewVisible = ref(false);
const fileList = ref([]);
const formRef = ref(null);

let isRouteChanging = false; // 新增标志

const loadData = () => {
  const query = {
    ...searchParams.value,
    type: activeKey.value,
  };
  myAxios.post('/search/all', query).then((res: any) => {
    if (activeKey.value === 'post') {
      postList.value = res.data.dataList;
    } else if (activeKey.value === 'picture') {
      pictureList.value = res.data.dataList;
    } else if (activeKey.value === 'user') {
      userList.value = res.data.dataList;
    }
    total.value = res.data.total; // 更新总记录数
    isRouteChanging = false; // 请求完成后重置标志
  });
};

const loadUser = () => {
  const token = localStorage.getItem('token');
  if (token) {
    myAxios.get('/user/find').then((res: any) => {
      if (res.data) {
        fileList.value = [{ url: res.data.userAvatar }];
        user.value = res.data;
      }
    });
  }
};

onMounted(() => {
  loadData();
  loadUser();
});

const onSearch = (value: string) => {
  isRouteChanging = true; // 设置标志
  searchParams.value = {  // 更新搜索参数
    ...searchParams.value,
    searchText: value,
    pageNum: 1,
  };
  router.push({
    path: route.path,
    query: { ...searchParams.value },
  }).then(() => {
    loadData();
  });
};

const handleSearch = (e) => {
  const prefix = e.target.value;
  myAxios.get('/search/suggest', {
    params: { prefix, type: activeKey.value },
  }).then((res: any) => {
    if (res) {
      suggestions.value = res.data;
    } else {
      suggestions.value = [];
    }
  });
};

// 处理选中联想词事件
const onSelect = (value: string) => {
  searchParams.value.searchText = value;
  onSearch(value);
  suggestions.value = [];
};

const onTabChange = (key: string) => {
  isRouteChanging = true; // 设置标志
  searchParams.value = {  // 更新搜索参数
    ...searchParams.value,
    pageNum: 1,
  };
  router.push({
    path: `/${key}`,
    query: { ...searchParams.value },
  }).then(() => {
    loadData();
  });
};

const onPageChange = (page: number) => {
  isRouteChanging = true; // 设置标志
  searchParams.value = {  // 更新搜索参数
    ...searchParams.value,
    pageNum: page,
  };
  router.push({
    path: route.path,
    query: { ...searchParams.value }, // 更新页码
  }).then(() => {
    loadData();
  });
};
// 登录注册
const showModal = () => {
  if (user.value.userAccount) {
    loadUser();
    isUpdateVisible.value = true;
  } else {
    isModalVisible.value = true;
  }
};
const handleOk = () => {
  formRef.value
    .validate()
    .then(async () => {
      if (isRegistering.value) {
        await registerUser();
      } else {
        await loginUser();
      }
    })
    .catch(() => {
      message.error('表单验证失败');
    });
};
const handleCancel = () => {
  isModalVisible.value = false;
};
const handleCancelUpdate = () => {
  isUpdateVisible.value = false;
  loadUser();
};
const loginUser = async () => {
  try {
    const res = await myAxios.post('/user/login', {
      userAccount: user.value.userAccount,
      userPassword: user.value.userPassword,
    });
    if (res.data) {
      isModalVisible.value = false;
      message.success('登录成功');
      user.value = res.data;
      localStorage.setItem('token', res.data.token);
      loadUser(); // 登录成功后重新加载用户信息
    } else {
      isModalVisible.value = true;
      message.error(res.message);
    }
  } catch (error) {
    message.error('登录失败');
  }
};
const registerUser = async () => {
  try {
    const res = await myAxios.post('/user/register', user.value);
    if (res.data) {
      isModalVisible.value = false;
      message.success('注册成功');
    } else {
      isModalVisible.value = true;
      message.error(res.message);
    }
    isRegistering.value = false;
  } catch (error) {
    message.error('注册失败');
  }
};
const handleUpdate = async () => {
  const res = await myAxios.post('/user/update', user.value);
  if (res.data) {
    isUpdateVisible.value = false;
    message.success('更新成功');
    loadUser(); // 更新成功后重新加载用户信息
  } else {
    message.error('更新失败');
  }
};
const handleLogout = () => {
  localStorage.removeItem('token');
  user.value = {
    userAccount: '',
    userPassword: '',
    checkPassword: '',
    userName: '',
    userAvatar: "",
    userProfile: '',
  };
  isUpdateVisible.value = false;
  message.success('退出登录成功');
};
const uploadFile = ({ file }) => {
  const formData = new FormData();
  formData.append('file', file);
  myAxios.post('/file/upload', formData).then((res: any) => {
    fileList.value = [{ url: res.data }];
    user.value.userAvatar = res.data;
  });
};
const handleChange = () => {
  fileList.value = [];
  user.value.userAvatar = '';
};

// 监听路由变化
watch(route, () => {
  if (!isRouteChanging) { // 检查标志
    searchParams.value = {
      searchText: route.query.searchText || '',
      pageNum: 1,
      pageSize: 8,
    };
    activeKey.value = route.params.category || 'post';
    if (!route.query.pageSize || !route.query.pageNum) {
      router.push({
        path: route.path,
        query: {
          ...route.query,
          pageNum: 1,
          pageSize: 8,
        },
      });
    } else {
      loadData();
    }
  }
});
</script>

<style scoped>
.search-container {
  position: relative;
  padding-top: 20px;
  margin: 0 auto;
  max-width: 1024px;
}

.suggestion-container {
  position: absolute;
  width: 100%;
  background: white;
  z-index: 1000;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
}

.suggestion-item:hover {
  background-color: #f5f5f5;
}

.user-avatar {
  background-color: #87d068;
  position: absolute;
  top: 8px;
  right: 20px;
}
</style>
