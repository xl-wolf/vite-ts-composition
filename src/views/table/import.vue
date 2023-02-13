<template>
  <div>
    <div class="container">
      <div class="handle-box">
        <el-upload action="#" :limit="1" accept=".xlsx, .xls" :show-file-list="false" :before-upload="beforeUpload"
          :http-request="httpRequest" ref='uploadRef' :on-success="handleSuccess">
          <el-button class="mr10" type="success">批量导入</el-button>
        </el-upload>
        <el-button type="primary" :disabled="!candownload" @click="exportXlsx">导出Excel</el-button>
        <el-button type="primary" :disabled="!cangentable" @click="renderTable(resList)">生成表格</el-button>
      </div>
      <el-table :data="tableData" border stripe class="table" show-overflow-tooltip height="400">
        <el-table-column :prop="column.prop" :label="column.label" v-for="column in columnFiledList"
          :fixed="column.prop === 'orderNO' || column.prop === 'number' ? 'left' : column.prop === 'profit' ? 'right' : false"></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts" name="import">
import { ElMessage, UploadInstance, UploadProps } from 'element-plus';
import { ref } from 'vue';
import * as XLSX from 'xlsx';

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

const tableData = ref<TableItem[]>([]);

const importList = ref<any>([]);
const beforeUpload: UploadProps['beforeUpload'] = async (rawFile) => {
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.warning('表格大小不能超过2MB！')
    return false
  }
  importList.value = await analysisExcel(rawFile);
  return true;
};
const analysisExcel = (file: any) => {
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

const uploadedFileType: string[] = []
// 上层变量保存各类型单据的数据
const tempysj: { [key: string]: any } = {}
const tempfkd: { [key: string]: any } = {}
const tempskd: { [key: string]: any } = {}
const tempshd: { [key: string]: any } = {}
const resList = ref<any>([])
const cangentable = ref(false)
const httpRequest = async () => {
  // 把数据传给服务器后获取最新列表，这里只是示例，不做请求
  if (importList.value.length > 500) return ElMessage.warning('表格数据不得多于500条')
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
        number: index + 1,
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
        // profit: item['应收金额'] - item['应付金额'] - item['售后渠道退款金额'] + item['售后仓库退款金额'],
      };
    }
  });
  uploadedFileType.push(ordertype)
  console.log(ordertype + ':', list)

  list.forEach((item: any) => {
    if (!item.orderNO) ElMessage.warning('存在没有订单编号的数据')

    if (item.shouldpayfee === 0 || item.shouldpayfee) {
      if (!tempfkd[item.orderNO]) {
        tempfkd[item.orderNO] = item.shouldpayfee
      } else {
        tempfkd[item.orderNO] = [tempfkd[item.orderNO]].concat(item.shouldpayfee)
        ElMessage.warning(`订单编号为${tempfkd.orderNO}的付款单数据存在重复`)
      }
    }
    else if (item.shouldgetfee === 0 || (item.shouldgetfee)) {
      if (!tempskd[item.orderNO]) {
        tempskd[item.orderNO] = item.shouldgetfee
      } else {
        tempskd[item.orderNO] = [tempskd[item.orderNO]].concat(item.shouldgetfee)
        ElMessage.warning(`订单编号为${item.orderNO}的收款单数据存在重复`)
      }
    }
    else if ((item.salecanalrefund === 0 || item.salecanalrefund) && (item.salerepositoryrefund === 0 || item.salerepositoryrefund)) {
      if (!tempshd[item.orderNO]) {
        tempshd[item.orderNO] = `售后渠道退款金额${item.salecanalrefund}售后仓库退款金额${item.salerepositoryrefund}`
      } else {
        tempshd[item.orderNO] = [tempshd[item.orderNO]].concat(`售后渠道退款金额${item.salecanalrefund}售后仓库退款金额${item.salerepositoryrefund}`)
        ElMessage.warning(`订单编号为${item.orderNO}的售后单数据存在重复`)
      }
    }
    else {
      if (!tempysj[item.orderNO]) {
        tempysj[item.orderNO] = item
      } else {
        tempysj[item.orderNO] = [tempysj[item.orderNO]].concat(item)
        ElMessage.warning(`订单编号为${item.orderNO}的源数据单数据存在重复`)
      }
    }
  });
  // if (Array.from(new Set(uploadedFileType)).length !== 4) return ElMessage.error('表单类型未上传完整，无法使用！')
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
  console.log(tempysj, 'tempysj')
  console.log(tempfkd, 'tempfkd')
  console.log(tempskd, 'tempskd')
  console.log(tempshd, 'tempshd')
  console.log(tmpresList, 'tmpresList')
  cangentable.value = Array.from(new Set(uploadedFileType)).length === 4
  resList.value = tmpresList
};

// 大数据情况下模拟分页加载
const candownload = ref(false)
let start = 0;
let offset = 15;
const renderTable = (list: any[]) => {
  const timer = setTimeout(() => {
    tableData.value = tableData.value.concat(list.slice(start, start + offset))
    start += offset
    if (tableData.value.length >= list.length) {
      ElMessage.success('表格渲染完毕！')
      candownload.value = uploadedFileType.length === 4
      clearTimeout(timer)
      start = 0;
      offset = 15;
    } else {
      renderTable(list)
    }
  }, 200);
}

const uploadRef = ref<UploadInstance>()
const handleSuccess = () => uploadRef.value!.clearFiles(); //上传成功之后清除历史记录


const exportXlsx = () => {
  if (!uploadedFileType.includes('源数据')) return ElMessage.error('请先上传源数据，否则无法使用功能下载')

  const downloadList = [
    [
      '订单编号',
      '商品名称',
      '商品数量',
      '渠道',
      '成本单价',
      '成本（成本价X数量+供应商运费）',
      '渠道价格',
      '销售金额（供货价X数量+运费）',
      '下单时间',
      '收件人',
      '收件人电话',
      '收件人地址',
      '发货状态',
      '订单状态',
      '应付金额',
      '应收金额',
      '售后渠道退款金额',
      '售后仓库退款金额',
      '利润',
    ]
  ];

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
  console.log(new_workbook, 'new_workbook')
  XLSX.utils.book_append_sheet(new_workbook, WorkSheet, '第一页');
  XLSX.writeFile(new_workbook, `表格.xlsx`);
};
</script>

<style scoped lang="less">
.handle-box {
  display: flex;
  margin-bottom: 20px;
}

.table {
  width: 100%;
  font-size: 14px;
}

.mr10 {
  margin-right: 10px;
}
</style>
