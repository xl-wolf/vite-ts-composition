<template>
  <div class="container">
    <div class="handle-box">
      <el-upload action="#" drag multiple class="upload-com mr10" accept=".xlsx, .xls" :show-file-list="false"
        :before-upload="beforeUpload" :http-request="httpRequest" ref='uploadRef' :on-success="handleSuccess">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <el-popover placement="top-start" title="提示" :width="200" trigger="hover" content="只有生成表格之后才可使用下载功能">
        <template #reference>
          <el-button type="primary" @click="exportXlsx">导出Excel</el-button>
        </template>
      </el-popover>
      <el-popover placement="top-start" title="提示" :width="200" trigger="hover" content="必须上传数据源、收款单、付款单成功后才可以生成表格">
        <template #reference>
          <el-button type="primary" @click="genTable(resList)" :disabled="disableGenTable"
            :loading="geningtable">生成表格</el-button>
        </template>
      </el-popover>
      <el-popover placement="top-start" title="提示" :width="200" trigger="hover" content="点击清空已上传的文件与已缓存文件">
        <template #reference>
          <el-button type="primary" @click="reset">重新上传</el-button>
        </template>
      </el-popover>

      <el-button type="primary" @click="cacheFunc">{{ enableCache ? '清空缓存' : '启用缓存' }}</el-button>

    </div>

    <div class="upload-file-list" v-if="uploadFiles.length">
      <h3>已上传文件列表：</h3>
      <div v-for="(uploadFile, index) in uploadFiles">
        {{ `${index + 1}、${uploadFile.name}` }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="import">
import { ElButton, ElIcon, ElMessage, ElPopover, ElUpload, UploadInstance, UploadProps, UploadRawFile } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import { nextTick, onMounted, ref } from 'vue';
import * as XLSX from 'xlsx';
import indexDB from '../utils/indexDB'
import { isNumber } from '../utils/types';
// @ts-ignore
import { showLoading, hideLoading } from "@/assets/js/MagicLoading.js"
const loadingContainer = document.body

const columnFiledList: { [key: string]: string }[] = [
  { prop: 'number', label: '序号' },
  { prop: 'orderNO', label: '订单编号' },
  { prop: 'name', label: '商品名称' },
  { prop: 'count', label: '商品数量' },
  { prop: 'canal', label: '渠道名称' },
  { prop: 'price', label: '单品成本' },
  { prop: 'cost', label: '成本（成本价X数量+供应商运费）' },
  { prop: 'canalcost', label: '渠道供货价' },
  { prop: 'salefee', label: '销售金额（供货价X数量+运费）' },
  { prop: 'buytime', label: '下单时间' },
  { prop: 'paytime', label: '支付时间' },
  { prop: 'repositoryname', label: '仓库名称' },
  { prop: 'pushrepositorytime', label: '推仓时间' },
  { prop: 'realtime', label: '实际发货时间' },
  { prop: 'transportationexpenses', label: '运费' },
  { prop: 'logisticNO', label: '物流单号' },
  { prop: 'receiver', label: '收件人' },
  { prop: 'receiverphone', label: '电话' },
  { prop: 'receiveraddress', label: '详细地址' },
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
  paytime: string
  repositoryname: string
  pushrepositorytime: string
  realtime: string
  transportationexpenses: string
  logisticNO: string
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
  const fileSizeLimit = 100
  if (file.size / 1024 / 1024 > fileSizeLimit) {
    return {
      status: false,
      msg: `文件大小不能超过${fileSizeLimit}MB！`
    }
  }
  if (uploadFiles.value.some((uploadedfile) => file.name === uploadedfile.name)) {
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
const uploadFiles = ref<{ name: string }[]>([])

// 文件上传前的校验
const beforeUpload: UploadProps['beforeUpload'] = async (rawFile: UploadRawFile) => {
  // 未通过校验则弹窗提示
  const { status, msg } = canUploadFile(rawFile)
  if (!status) {
    ElMessage.warning(msg)
    return false
  }
  showLoading(loadingContainer, ['#409eff', '#409eff', '#409eff', '#409eff'])
  // 校验通过后的操作
  importList.value = await analysisExcel(rawFile);
  hideLoading(loadingContainer)
  const { name } = rawFile
  uploadFiles.value.push({ name: name })
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
let uploadedFileType: string[] = [] //表格的类型列表，付款单，收款单，售后单，源数据，少一个都无法使用生成表格和导出excel功能
// 各种excel的内存对象数据
let tempysj: { [key: string]: any } = {}
let tempfkd: { [key: string]: any } = {}
let tempskd: { [key: string]: any } = {}
let tempshd: { [key: string]: any } = {}
// 用于生成tabledata的中间列表
const resList = ref<any>([])
// 重复的订单编号列表
const duplicateOrderList = ref<any>([])
const httpRequest = async () => {
  const rowLimit = 500000
  if (importList.value.length > rowLimit) return ElMessage.warning(`表格数据不得多于${rowLimit}条`)

  const existOrequalzero = (data: number) => data === 0 || data

  let ordertype = ''
  const list = importList.value.map((item: any, index: number) => {
    if (!item['订单编号']) return {};
    if (existOrequalzero(item['应付金额'])) {
      ordertype = '付款单'
      return {
        orderNO: item['订单编号'],
        shouldpayfee: item['应付金额'],
      }
    }
    else if (existOrequalzero(item['应收金额'])) {
      ordertype = '收款单'
      return {
        orderNO: item['订单编号'],
        shouldgetfee: item['应收金额'],
      }
    }
    else if (existOrequalzero(item['售后渠道退款金额']) && existOrequalzero(item['售后仓库退款金额'])) {
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
        canal: item['渠道名称'],
        price: item['单品成本'],
        cost: item['成本（成本价X数量+供应商运费）'],
        canalcost: item['渠道供货价'],
        salefee: item['销售金额（供货价X数量+运费）'],
        buytime: isNumber(item['下单时间']) ? formatDate(item['下单时间']) : item['下单时间'],
        paytime: isNumber(item['支付时间']) ? formatDate(item['支付时间']) : item['支付时间'],
        repositoryname: item['仓库名称'],
        pushrepositorytime: isNumber(item['推仓时间']) ? formatDate(item['推仓时间']) : item['推仓时间'],
        realtime: isNumber(item['实际发货时间']) ? formatDate(item['实际发货时间']) : item['实际发货时间'],
        transportationexpenses: item['运费'],
        logisticNO: item['物流单号'],
        receiver: item['收件人'],
        receiverphone: item['电话'],
        receiveraddress: item['详细地址'],
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
  ordertype && uploadedFileType.push(ordertype)
  uploadedFileType = [...new Set(uploadedFileType)]
  console.log('uploadedFileType', uploadedFileType)

  list.forEach((item: any) => {
    if (!item.orderNO || item.orderNO.trim().slice(0, 1).toUpperCase() !== 'W') { return console.log(`无效订单编号：${item.orderNO}`) }
    if (existOrequalzero(item.shouldpayfee) && item.orderNO) {
      if (!tempfkd[item.orderNO]) {
        if (item.orderNO)
          tempfkd[item.orderNO] = item.shouldpayfee
      } else {
        duplicateOrderList.value.push({ '付款单': item.orderNO })
      }
    }
    else if (existOrequalzero(item.shouldgetfee) && item.orderNO) {
      if (!tempskd[item.orderNO]) {
        if (item.orderNO)
          if (item.orderNO)
            tempskd[item.orderNO] = item.shouldgetfee
      } else {
        duplicateOrderList.value.push({ '收款单': item.orderNO })
      }
    }
    else if (existOrequalzero(item.salecanalrefund) && existOrequalzero(item.salerepositoryrefund) && item.orderNO) {
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
  // if (enableCache.value) {
  //   cacheData()
  // }
  // 全部表单都上传之后才可以允许生成表格
  if (!canGenTable(false)) return

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
  console.log(`表格长度：${resList.value.length}`)
  console.log(`重复订单的数量：${duplicateOrderList.value.length}`, duplicateOrderList.value)
  // 此时允许用户生成表格
  disableGenTable.value = false
  // 重新上传表格后需要重置表格
  tableData.value = []
};
// 读取excel的日期格式之后数据不是想要的格式，可以通过以下方法来处理
const formatDate = (numb: number) => {
  const old = numb - 1;
  const t = Math.round((old - Math.floor(old)) * 24 * 60 * 60);
  const time = new Date(1900, 0, old, 0, 0, t)
  const year = time.getFullYear();
  const [month, date, hour, minite] = [
    String(time.getMonth() + 1),
    String(time.getDate()),
    String(time.getHours()),
    String(time.getMinutes()),
  ].map(timestr => timestr.padStart(2, '0'));
  return `${year}-${month}-${date} ${hour}:${minite}`
}

// 大数据情况下模拟分页加载
const tableData = ref<TableItem[]>([]);
const disableGenTable = ref(false)
const geningtable = ref(false)
let start = 0;
let offset = 500;

const canGenTable = (needToast = true) => {
  const allFileType = ['收款单', '付款单', '源数据']
  for (let i = 0; i < allFileType.length; i++) {
    if (!uploadedFileType.includes(allFileType[i])) {
      needToast && ElMessage.warning(`请先上传${allFileType[i]}，否则无法使用生成表格功能！`)
      return false
    }
  }
  return true
}
const genTable = (list: any[]) => {
  if (!canGenTable()) return

  showLoading(loadingContainer, ['#409eff', '#409eff', '#409eff', '#409eff'])
  geningtable.value = true
  const timer = setTimeout(() => {
    tableData.value = tableData.value.concat(list.slice(start, start + offset))
    start += offset
    if (tableData.value.length >= list.length) {
      ElMessage.success('生成表格成功！')
      hideLoading(loadingContainer)
      // console.log(tableData.value, 'tableData.value')
      geningtable.value = false
      disableGenTable.value = true
      candownload.value = uploadedFileType.length >= 2
      clearTimeout(timer)
      start = 0;
      offset = 500;
    } else {
      genTable(list)
    }
  }, 200);
}

//上传成功之后清除历史记录
const uploadRef = ref<UploadInstance>()
const handleSuccess = () => uploadRef.value!.clearFiles();

// 下载excel的方法
const candownload = ref(false)
const downloading = ref(false)
const exportXlsx = () => {
  if (downloading.value) return ElMessage.success('正在导出表格，请稍后！')
  downloading.value = true
  if (!candownload.value) return ElMessage.warning('请先生成表格！')
  if (!uploadedFileType.includes('源数据')) return ElMessage.warning('请先上传源数据，否则无法使用功能下载')

  const downloadList = [columnFiledList.map(item => { if (item.label !== '序号') { return item.label } }).slice(1)]
  // console.log(tableData.value, ' tableData.value')
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
      item.paytime,
      item.repositoryname,
      item.pushrepositorytime,
      item.realtime,
      item.transportationexpenses,
      item.logisticNO,
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
  downloading.value = false
};

// 重置功能
const reset = () => {
  if (uploadFiles.value.length === 0) return ElMessage.warning(`未上传文件时，功能不可用`)
  candownload.value = false
  disableGenTable.value = false
  geningtable.value = false
  tableData.value = []
  start = 0;
  duplicateOrderList.value = []
  resList.value = []
  tempysj = {}
  tempfkd = {}
  tempskd = {}
  tempshd = {}
  uploadedFileType = []
  importList.value = []
  uploadFiles.value = []
  // clearCache()
}

// 是否启用缓存功能
const enableCache = ref(false)
const cacheFunc = () => {
  return ElMessage.warning('功能优化中，请期待。。。')
  // enableCache.value = !enableCache.value
  // enableCache.value ? cacheData() : clearCache()
}

// let storageData: { [key: string]: any } = {}
// const clearCache = () => {
//   enableCache.value = false
//   storageData = {}
//   localStorage.removeItem('storageData')
//   localStorage.removeItem('enableCache')
// }

// const cacheData = () => {
//   storageData['candownload'] = candownload.value
//   storageData['disableGenTable'] = disableGenTable.value
//   storageData['geningtable'] = geningtable.value
//   storageData['tableData'] = tableData.value
//   storageData['start'] = start
//   storageData['duplicateOrderList'] = duplicateOrderList.value
//   storageData['resList'] = resList.value
//   storageData['tempysj'] = tempysj
//   storageData['tempfkd'] = tempfkd
//   storageData['tempskd'] = tempskd
//   storageData['tempshd'] = tempshd
//   storageData['uploadedFileType'] = uploadedFileType
//   storageData['importList'] = importList.value
//   storageData['uploadFiles'] = uploadFiles.value
//   localStorage.setItem('storageData', JSON.stringify(storageData))
//   localStorage.setItem('enableCache', JSON.stringify(enableCache.value ? 1 : 0))
  
  
// }
// 优先从缓存中读取数据
// const getCache = () => {
//   const cache = localStorage.getItem('storageData')
//   const sessionenableCache = localStorage.getItem('enableCache')
//   if (cache) {
//     enableCache.value = Boolean(sessionenableCache)
//     const storageData = JSON.parse(cache)
//     candownload.value = storageData.candownload
//     disableGenTable.value = storageData.disableGenTable
//     geningtable.value = storageData.geningtable
//     tableData.value = storageData.tableData
//     start = storageData.start
//     duplicateOrderList.value = storageData.duplicateOrderList
//     resList.value = storageData.resList
//     tempysj = storageData.tempysj
//     tempfkd = storageData.tempfkd
//     tempskd = storageData.tempskd
//     tempshd = storageData.tempshd
//     uploadedFileType = storageData.uploadedFileType
//     importList.value = storageData.importList
//     uploadFiles.value = storageData.uploadFiles
//   }
// }

// onMounted(getCache)
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

}

.upload-file-list {
  line-height: 32px;
  min-width: 240px;
  margin: 0 14px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.7);
  flex: 1;
  max-height: 300px;
  overflow: auto;
}

.table {
  width: 100%;
  font-size: 14px;
}
</style>
