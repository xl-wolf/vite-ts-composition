<template>
  <div>
    <div class="container">
      <div class="handle-box">
        <el-upload action="#" :limit="1" accept=".xlsx, .xls" :show-file-list="false" :before-upload="beforeUpload"
          :http-request="httpRequest" ref='uploadRef' :on-success="handleSuccess">
          <el-button class="mr10" type="success">批量导入</el-button>
        </el-upload>
        <el-button type="primary" @click="exportXlsx">导出Excel</el-button>
      </div>
      <el-table :data="tableData" border stripe class="table" show-overflow-tooltip height="600">
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
  importList.value = await analysisExcel(rawFile);
  return true;
};
const analysisExcel = (file: any) => {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function (e: any) {
      const data = e.target.result;
      const datajson = XLSX.read(data, { type: 'binary' });
      console.log(datajson)

      const sheetName = datajson.SheetNames[0];
      const result = XLSX.utils.sheet_to_json(datajson.Sheets[sheetName]);
      resolve(result);
    };
    reader.readAsBinaryString(file);
  });
};

const httpRequest = async () => {
  // 把数据传给服务器后获取最新列表，这里只是示例，不做请求
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
        profit: item['应收金额'] - item['应付金额'] - item['售后渠道退款金额'] + item['售后仓库退款金额'],
      };
    }
  });
  console.log(ordertype + ':', list)
  const tmp: { [key: string]: any } = {}
  list.forEach((item: any) => {
    if (!item.orderNO) ElMessage.warning('存在没有订单编号的数据')

    if (item.shouldpayfee === 0 || item.shouldpayfee) {
      if (!tmp[item.orderNO]) {
        tmp[item.orderNO] = item.shouldpayfee
      } else {
        tmp[item.orderNO] = [tmp[item.orderNO]].concat(item.shouldpayfee)
        ElMessage.warning(`订单编号为${item.orderNO}的数据存在重复`)
      }
    }
    else if (item.shouldgetfee === 0 || (item.shouldgetfee)) {
      if (!tmp[item.orderNO]) {
        tmp[item.orderNO] = item.shouldgetfee
      } else {
        tmp[item.orderNO] = [tmp[item.orderNO]].concat(item.shouldgetfee)
        ElMessage.warning(`订单编号为${item.orderNO}的数据存在重复`)
      }
    }
    else if ((item.salecanalrefund === 0 || item.salecanalrefund) && (item.salerepositoryrefund === 0 || item.salerepositoryrefund)) {
      if (!tmp[item.orderNO]) {
        tmp[item.orderNO] = `售后渠道退款金额:${item.salecanalrefund}售后仓库退款金额:${item.salerepositoryrefund}`
      } else {
        tmp[item.orderNO] = [tmp[item.orderNO]].concat(`售后渠道退款金额:${item.salecanalrefund}售后仓库退款金额:${item.salerepositoryrefund}`)
        ElMessage.warning(`订单编号为${item.orderNO}的数据存在重复`)
      }
    }
    else {
      if (!tmp[item.orderNO]) {
        tmp[item.orderNO] = item
      } else {
        tmp[item.orderNO] = [tmp[item.orderNO]].concat(item)
        ElMessage.warning(`订单编号为${item.orderNO}的数据存在重复`)
      }
    }
  });
  console.log(tmp, 'tmp')
  // tableData.value.push(...list);
  // console.log(tableData.value)
};

const uploadRef = ref<UploadInstance>()
const handleSuccess = () => uploadRef.value!.clearFiles(); //上传成功之后清除历史记录


const list = [
  [
    '序号',
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
const exportXlsx = () => {
  tableData.value.map((item: TableItem, i: number) => {
    const arr: any[] = [];
    arr.push(...[
      item.number,
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
    list.push(arr);
  });
  const WorkSheet = XLSX.utils.aoa_to_sheet(list);
  const new_workbook = XLSX.utils.book_new();
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

// /deep/.el-table .cell {
//   max-width: 240px !important;
//   white-space: nowrap !important;
//   overflow: hidden !important;
//   text-overflow: ellipsis !important;
// }

.mr10 {
  margin-right: 10px;
}
</style>
