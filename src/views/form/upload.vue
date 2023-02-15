<template>
  <div class="container">
    <div class="handle-box">
      <el-upload action="#" drag multiple class="upload-com mr10" accept=".xlsx, .xls" :show-file-list="false"
        :before-upload="beforeUpload" :http-request="httpRequest" ref='uploadRef' :on-success="handleSuccess">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <div class="upload-file-list" v-if="uploadFiles.length">
        <h3>已上传文件列表：</h3>
        <div v-for="(uploadFile, index) in uploadFiles">
          {{`${index + 1}、${uploadFile.name}`}}
        </div>
      </div>

      <el-popover placement="top-start" title="提示" :width="200" trigger="hover" content="只有生成表格之后才可使用下载功能">
        <template #reference>
          <el-button type="primary" @click="exportXlsx">导出Excel</el-button>
        </template>
      </el-popover>
      <el-popover placement="top-start" title="提示" :width="200" trigger="hover" content="只有所有类型的表单都上传成功后才可以生成表格">
        <template #reference>
          <el-button type="primary" @click="renderTable(resList)" :loading="geningtable">生成表格</el-button>
        </template>
      </el-popover>
    </div>
    <el-table :data="tableData" border stripe class="table" max-height="550">
      <el-table-column :prop="column.prop" :label="column.label" width="140" align="center" show-overflow-tooltip
        tooltip-effect="dark" v-for="column in columnFiledList"
        :fixed="column.prop === 'orderNO' || column.prop === 'number' ? 'left' : column.prop === 'profit' ? 'right' : false"></el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts" name="import">
import { ElButton, ElIcon, ElMessage, ElPopover, ElTable, ElTableColumn, ElUpload, UploadInstance, UploadProps, UploadRawFile } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import { nextTick, ref } from 'vue';
import * as XLSX from 'xlsx';
// @ts-ignore
import { showLoading, hideLoading } from "@/assets/js/MagicLoading.js"

const columnFiledList: { [key: string]: string }[] = [
  { prop: 'number', label: '序号' },
  { prop: 'orderNO', label: '订单编号' },
  { prop: 'name', label: '商品名称' },
  { prop: 'count', label: '商品数量' },
  { prop: 'canal', label: '渠道' },
  { prop: 'price', label: '成本单价' },
  { prop: 'cost', label: '成本（成本价X数量+供应商运费）' },
  { prop: 'canalcost', label: '渠道价格' },
  { prop: 'salefee', label: '销售金额（供货价X数量+运费）' },
  { prop: 'buytime', label: '下单时间' },
  { prop: 'receiver', label: '收件人' },
  { prop: 'receiverphone', label: '收件人电话' },
  { prop: 'receiveraddress', label: '收件人地址' },
  { prop: 'productstatus', label: '发货状态' },
  { prop: 'orderstatus', label: '订单状态' },
  { prop: 'shouldpayfee', label: '应付金额' },
  { prop: 'shouldgetfee', label: '应收金额' },
  { prop: 'salecanalrefund', label: '售后渠道退款金额' },
  { prop: 'salerepositoryrefund', label: '售后仓库退款金额' },
  { prop: 'profit', label: '利润' },
]

interface TableItem {
  number: number,
  orderNO: string
  name: string
  count: string
  canal: string
  price: string
  cost: string
  canalcost: string
  salefee: string
  buytime: string
  receiver: string
  receiverphone: string
  receiveraddress: string
  productstatus: string
  orderstatus: string
  shouldpayfee: string
  shouldgetfee: string
  salecanalrefund: string
  salerepositoryrefund: string
  profit: string,
}

const canUploadFile = (file: UploadRawFile) => {
  if (file.size / 1024 / 1024 > 2) {
    return {
      status: false,
      msg: '文件大小不能超过2MB！'
    }
  }
  if (uploadFiles.value.some((uploadedfile: UploadRawFile) => file.name === uploadedfile.name)) {
    return {
      status: false,
      msg: `${file.name}已上传过！`
    }
  }

  return {
    status: true,
    msg: ``
  }
}
const importList = ref<any>([]);
const uploadFiles = ref<UploadRawFile[]>([])

// 文件上传前的校验
const beforeUpload: UploadProps['beforeUpload'] = async (rawFile: UploadRawFile) => {
  // 未通过校验则弹窗提示
  const { status, msg } = canUploadFile(rawFile)
  if (!status) {
    ElMessage.warning(msg)
    return false
  }
  // 校验通过后的操作
  importList.value = await analysisExcel(rawFile);
  uploadFiles.value.push(rawFile)
  nextTick(scrollToDomBottom)

  return true;
};
// 工具方法用于解析Excel
const analysisExcel = (file: UploadRawFile) => {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function (e: any) {
      const data = e.target.result;
      const datajson = XLSX.read(data, { type: 'binary' });
      const sheetName = datajson.SheetNames[0];
      const result = XLSX.utils.sheet_to_json(datajson.Sheets[sheetName]);
      resolve(result);
    };
    reader.readAsBinaryString(file);
  });
};

// 滚动到dom的底部
const uploadFilesDom = ref()
const scrollToDomBottom = () => {
  uploadFilesDom.value = uploadFilesDom.value ? uploadFilesDom.value : document.querySelector('.upload-file-list') as HTMLElement
  uploadFilesDom.value.scrollTop = uploadFilesDom.value.scrollHeight;
}

// 在内存中处理从上次的excel里面读取出来的数据
const uploadedFileType: string[] = [] //表格的类型列表，付款单，收款单，售后单，源数据，少一个都无法使用生成表格和导出excel功能
// 各种excel的内存对象数据
const tempysj: { [key: string]: any } = {}
const tempfkd: { [key: string]: any } = {}
const tempskd: { [key: string]: any } = {}
const tempshd: { [key: string]: any } = {}
// 用于生成tabledata的中间列表
const resList = ref<any>([])
// 重复的订单编号列表
const duplicateOrderList = ref<any>([])
const httpRequest = async () => {
  if (importList.value.length > 5000) return ElMessage.warning('表格数据不得多于5000条')

  let ordertype = ''
  const list = importList.value.map((item: any, index: number) => {
    if (item['应付金额'] === 0 || item['应付金额']) {
      ordertype = '付款单'
      return {
        orderNO: item['订单编号'],
        shouldpayfee: item['应付金额'],
      }
    }
    else if (item['应收金额'] === 0 || (item['应收金额'])) {
      ordertype = '收款单'
      return {
        orderNO: item['订单编号'],
        shouldgetfee: item['应收金额'],
      }
    }
    else if ((item['售后渠道退款金额'] === 0 || item['售后渠道退款金额']) && (item['售后仓库退款金额'] === 0 || item['售后仓库退款金额'])) {
      ordertype = '售后单'
      return {
        orderNO: item['订单编号'],
        salecanalrefund: item['售后渠道退款金额'],
        salerepositoryrefund: item['售后仓库退款金额'],
      }
    }
    else {
      ordertype = '源数据'
      return {
        orderNO: item['订单编号'],
        name: item['商品名称'],
        count: item['商品数量'],
        canal: item['渠道'],
        price: item['成本单价'],
        cost: item['成本（成本价X数量+供应商运费）'],
        canalcost: item['渠道价格'],
        salefee: item['销售金额（供货价X数量+运费）'],
        buytime: item['下单时间'],
        receiver: item['收件人'],
        receiverphone: item['收件人电话'],
        receiveraddress: item['收件人地址'],
        productstatus: item['发货状态'],
        orderstatus: item['订单状态'],
        shouldpayfee: item['应付金额'],
        shouldgetfee: item['应收金额'],
        salecanalrefund: item['售后渠道退款金额'],
        salerepositoryrefund: item['售后仓库退款金额'],
        profit: NaN
      };
    }
  });
  uploadedFileType.push(ordertype)

  list.forEach((item: any) => {
    if (String(item.shouldpayfee)) {
      if (!tempfkd[item.orderNO]) {
        if (item.orderNO)
          tempfkd[item.orderNO] = item.shouldpayfee
      } else {
        duplicateOrderList.value.push({ '付款单': item.orderNO })
      }
    }
    else if (String(item.shouldgetfee)) {
      if (!tempskd[item.orderNO]) {
        if (item.orderNO)
          if (item.orderNO)
            tempskd[item.orderNO] = item.shouldgetfee
      } else {
        duplicateOrderList.value.push({ '收款单': item.orderNO })
      }
    }
    else if (String(item.salecanalrefund) && String(item.salerepositoryrefund)) {
      if (!tempshd[item.orderNO]) {
        if (item.orderNO)
          tempshd[item.orderNO] = `售后渠道退款金额${item.salecanalrefund}售后仓库退款金额${item.salerepositoryrefund}`
      } else {
        duplicateOrderList.value.push({ '售后单': item.orderNO })
      }
    }
    else {
      if (!tempysj[item.orderNO]) {
        if (item.orderNO)
          tempysj[item.orderNO] = item
      } else {
        duplicateOrderList.value.push({ '源数据': item.orderNO })
      }
    }
  });

  // console.log(tempysj, 'tempysj')
  // console.log(tempfkd, 'tempfkd')
  // console.log(tempskd, 'tempskd')
  // console.log(tempshd, 'tempshd')
  // console.log(duplicateOrderList.value, 'duplicateOrderList.value')

  ElMessage.success(`上传${ordertype}成功`)
  // 全部表单都上传之后才可以允许生成表格
  if (Array.from(new Set(uploadedFileType)).length === 4) {
    const tmpresList: any[] = []
    Object.values(tempysj).forEach(item => {
      const shouldpayfee = tempfkd[item.orderNO]
      const shouldgetfee = tempskd[item.orderNO]
      const salecanalrefund = !Array.isArray(tempshd[item.orderNO]) ? tempshd[item.orderNO]?.split("售后仓库退款金额")[0].slice(8) : tempshd[item.orderNO]
      const salerepositoryrefund = !Array.isArray(tempshd[item.orderNO]) ? tempshd[item.orderNO]?.split("售后仓库退款金额")[1] : tempshd[item.orderNO]
      item = {
        ...item,
        ...{ shouldpayfee },
        ...{ shouldgetfee },
        ...{ salecanalrefund },
        ...{ salerepositoryrefund },
        ...{ profit: shouldgetfee - shouldpayfee - salecanalrefund + salerepositoryrefund },
      }
      tmpresList.push(item)
    })
    duplicateOrderList.value.forEach((duplicateOrder: any) => tmpresList.push({ orderNO: Object.values(duplicateOrder)[0] }))
    // console.log(tmpresList, 'tmpresList')
    // 根据订单编号给表格排序
    tmpresList.sort((a, b) => a.orderNO.slice(1) - b.orderNO.slice(1))
    // 给表格补上第一列的序号数据
    tmpresList.forEach((item, index) => item.number = index + 1)
    // 把函数内的临时内存数据tmpresList持久化给页面级别的变量resList
    resList.value = tmpresList
    // 此时允许用户生成表格
    cangentable.value = true
  }
};

// 大数据情况下模拟分页加载
const tableData = ref<TableItem[]>([]);
const cangentable = ref(false)
const geningtable = ref(false)
let start = 0;
let offset = 30;
const loadingContainer = document.body
const renderTable = (list: any[]) => {
  if (!cangentable.value) return ElMessage.error('请先上传所有类型的表格！')
  showLoading(loadingContainer, ['#409eff', '#409eff', '#409eff', '#409eff'])
  geningtable.value = true
  const timer = setTimeout(() => {
    tableData.value = tableData.value.concat(list.slice(start, start + offset))
    start += offset
    if (tableData.value.length >= list.length) {
      ElMessage.success('表格渲染完毕！')
      hideLoading(loadingContainer)
      // console.log(tableData.value, 'tableData.value')
      geningtable.value = false
      candownload.value = Array.from(new Set(uploadedFileType)).length === 4
      clearTimeout(timer)
      start = 0;
      offset = 30;
    } else {
      renderTable(list)
    }
  }, 200);
}

//上传成功之后清除历史记录
const uploadRef = ref<UploadInstance>()
const handleSuccess = () => uploadRef.value!.clearFiles();

// 下载excel的方法
const candownload = ref(false)
const exportXlsx = () => {
  if (geningtable.value) return ElMessage.success('正在努力生成表格，请稍后！')
  if (!candownload.value) return ElMessage.error('请先生成表格！')
  if (!uploadedFileType.includes('源数据')) return ElMessage.error('请先上传源数据，否则无法使用功能下载')

  const downloadList = [columnFiledList.map(item => { if (item.label !== '序号') { return item.label } }).slice(1)]

  tableData.value.forEach((item: TableItem) => {
    const arr: any[] = [];
    arr.push(...[
      item.orderNO,
      item.name,
      item.count,
      item.canal,
      item.price,
      item.cost,
      item.canalcost,
      item.salefee,
      item.buytime,
      item.receiver,
      item.receiverphone,
      item.receiveraddress,
      item.productstatus,
      item.orderstatus,
      item.shouldpayfee,
      item.shouldgetfee,
      item.salecanalrefund,
      item.salerepositoryrefund,
      item.profit,
    ]);
    downloadList.push(arr);
  });

  const WorkSheet = XLSX.utils.aoa_to_sheet(downloadList);
  const new_workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(new_workbook, WorkSheet, '第一页');
  XLSX.writeFile(new_workbook, `表格.xlsx`);
};
</script>

<style scoped lang="less">
.handle-box {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-end;

  .upload-com {
    min-width: 360px;
    margin-right: 10px;
  }

  .upload-file-list {
    line-height: 32px;
    min-width: 240px;
    margin: 0 14px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.7);
    flex: 1;
    max-height: 184px;
    overflow: auto;
  }
}

.table {
  width: 100%;
  font-size: 14px;
}
</style>
