<template>
  <!-- 表格 -->
  <div>
    <el-table
      ref="dataTable"
      :data="dataSource.list || []"
      :height="tableHeight"
      :stripe="options.stripe"
      :border="options.border"
      header-row-class-name="table-header-row"
      highlight-current-row
      @row-click="handleRowClick"
      @selection-change="handleSelectionChange"
    >
      <!-- selection 选择框 -->
      <el-table-column
        v-if="options.selectType && options.selectType == 'checkbox'"
        type="selection"
        width="50"
        align="center"
      ></el-table-column>
      <!-- 序号 -->
      <el-table-column
        v-if="options.showIndex"
        label="序号"
        type="index"
        width="60"
        align="center"
      ></el-table-column>
      <!-- 数据列 -->
      <template v-for="(column, index) in columns">
        <!-- 如果数据列中有插槽， 将其改造成插槽 -->
        <template v-if="column.scopedSlots">
          <el-table-column
            :key="index"
            :prop="column.prop"
            :label="column.label"
            :align="column.align || 'left'"
            :width="column.width"
          >
            <template #default="scope">
              <slot
                :name="column.scopedSlots"
                :index="scope.$index"
                :row="scope.row"
              >
              </slot>
            </template>
          </el-table-column>
        </template>
        <!-- 如果不是插槽，就正常操作 -->
        <template v-else>
          <el-table-column
            :key="index"
            :prop="column.prop"
            :label="column.label"
            :align="column.align || 'left'"
            :width="column.width"
            :fixed="column.fixed"
          >
          </el-table-column>
        </template>
      </template>
    </el-table>

    <!-- 分页 -->
    <!-- page-sizes 每页显示个数选择器的选项设置 -->
    <!-- page-size 每页显示条目个数 -->
    <!-- current-page 当前页数 -->
    <!-- layout	组件布局，子组件名用逗号分隔 -->
    <!-- size-change page-size 改变时触发 -->
    <!-- current-change	current-page 改变时触发 -->
    <div class="pagination" v-if="showPagination">
      <el-pagination
        v-if="dataSource.totalCount"
        background
        :total="dataSource.totalCount"
        :page-sizes="[15, 30, 50, 100]"
        :page-size="dataSource.pageSize"
        :current-page.sync="dataSource.pageNo"
        :layout="layout"
        @size-change="handlePageSizeChange"
        @current-change="handlePageNoChange"
        style="text-align: right"
      ></el-pagination>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// 将选中的行传递给父组件Main
const emit = defineEmits(["rowSelected", "rowClick"]);
// 子组件接受父组件的值
const props = defineProps({
  dataSource: Object,
  showPagination: {
    type: Boolean,
    default: true,
  },
  showPageSize: {
    type: Boolean,
    default: true,
  },
  options: {
    type: Object,
    default: {
      extHeight: 0,
      showIndex: false,
    },
  },
  columns: Array,
  fetch: Function, // 获取数据的函数
  initFetch: {
    type: Boolean,
    default: true,
  },
});

// 分页处布局
const layout = computed(() => {
  return `total, ${
    props.showPageSize ? "sizes" : ""
  }, prev, pager, next, jumper`;
});

// 计算顶部高度
//顶部 60 , 内容区域距离顶部 20， 内容上下内间距 15*2  分页区域高度 46
const topHeight = 60 + 20 + 30 + 46;

// 计算当前表格高度，实现页面内部滚动
const tableHeight = ref(
  props.options.tableHeight
    ? props.options.tableHeight
    : window.innerHeight - topHeight - props.options.extHeight
);

const init = () => {
  if (props.initFetch && props.fetch) {
    // 获取数据
    props.fetch();
  }
};
init();

const dataTable = ref();
// 清除选中
const clearSelection = () => {
  dataTable.value.clearSelection();
};
// 设置行选中
const setCurrentRow = (rowKey, rowValue) => {
  let row = props.dataSource.list.find((item) => {
    return item[rowKey] === rowValue;
  });
  dataTable.value.setCurrentRow(row);
};
// 将父组件最新的行信息更新到子组件中
// 将子组件暴露出去，否则无法调用
defineExpose({ setCurrentRow, clearSelection });

// 行点击
const handleRowClick = (row) => {
  emit("rowClick", row);
};
// 行选中(多行)
const handleSelectionChange = (row) => {
  emit("rowSelected", row);
};

// 切换每页大小
const handlePageSizeChange = (size) => {
  props.dataSource.pageSize = size;
  props.dataSource.pageNo = 1;
  // 获取数据
  props.fetch();
};

// 切换页码
const handlePageNoChange = (pageNo) => {
  props.dataSource.pageNo = pageNo;
  // 获取数据
  props.fetch();
};
</script>

<style lang="scss" scoped>
.pagination {
  padding-top: 10px;
  padding-right: 10px;
}
.el-pagination {
  justify-content: right;
}

:deep .el-table__cell {
  padding: 4px 0px;
}
</style>
