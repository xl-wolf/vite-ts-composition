<template>
	<div class="container">
		<div class="plugins-tips">超级管理员账号登录，可配置权限。</div>
		<div class="mgb20">
			<span class="label">角色：</span>
			<el-select v-model="role" @change="handleChange">
				<el-option label="超级管理员" value="admin"></el-option>
				<el-option label="普通用户" value="user"></el-option>
			</el-select>
		</div>
		<div class="mgb20 tree-wrapper">
			<el-tree ref="tree" :data="data" node-key="id" default-expand-all show-checkbox
				:default-checked-keys="checkedKeys" />
		</div>
		<el-button type="primary" @click="onSubmit">保存权限</el-button>
	</div>
</template>

<script setup lang="ts" name="permission">
import { ref } from 'vue';
import { ElTree } from 'element-plus';
import { usePermissStore } from '../store/permiss';

const role = ref<string>('admin');
interface Tree {
	id: string;
	label: string;
	children?: Tree[];
}

const data: Tree[] = [
	{
		id: '1',
		label: '系统首页'
	},
	{
		id: '2',
		label: '文件上传'
	},
	{
		id: '3',
		label: '导入Excel'
	},
	{
		id: '4',
		label: '导出Excel'
	},
	{
		id: '5',
		label: '自定义图标'
	},
	{
		id: '6',
		label: '权限管理'
	},
];

const permiss = usePermissStore();
// 生成el-tree所需要的default-checked-keys数据样子
const genCheckedKeys = () => Object.keys(permiss.defaultList[role.value]).map((key: string, index: number) => {
	if (permiss.defaultList[role.value][index]) {
		return String(+key + 1)
	}
	return ''
})
// 获取当前权限
const checkedKeys = ref<string[]>([]);
const getPremission = () => {
	// 请求接口返回权限
	checkedKeys.value = genCheckedKeys();
};
getPremission();

// 保存权限
const tree = ref<InstanceType<typeof ElTree>>();
const onSubmit = () => {
	// 获取选中的权限
	const tmpPermission = permiss.defaultList['admin'].map((permiss, index) => {
		if (tree.value!.getCheckedKeys(false).includes(String(index + 1))) {
			return permiss
		}
		return ''
	})
	console.log(tmpPermission);
};

const handleChange = (val: string[]) => tree.value!.setCheckedKeys(genCheckedKeys())

</script>

<style scoped>
.tree-wrapper {
	max-width: 500px;
}

.label {
	font-size: 14px;
}
</style>
