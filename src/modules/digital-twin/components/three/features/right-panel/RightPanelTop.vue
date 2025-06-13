<template>
  <div class="page-right-top">
    <div class="page-right-top-title">
      Weather Forecast
      <div class="border"></div>
    </div>
    <div class="page-right-top-content"  ref="rightTopContent"></div>
  </div>
</template>

<script setup >
import { ref, onMounted } from "vue";
let rightTopContent = ref(null);
import * as echarts from "echarts";
const init = () => {
  let myChart = echarts.init(rightTopContent.value);
  let option = {
    legend: {
      data: ["Real Time", "Expected"],
      bottom: "0%"
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      top: "0%",
      containLabel: true
    },

    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        data: ["18:00", "18:30", "19:30", "20:00", "20:30", "21:00", "21:30"],
        axisLine: {
          lineStyle: {
            color: "#98B5C9",
            width:2
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: "#434792"
        }
      },
      {
        type: "category",
        // boundaryGap: false,
        position: "top",
        offset: -15,
        data: ["", "", "", "", "", "", ""],
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          interval: 0,
          formatter: function(value, index) {
            return "{" + index + "| }\n{b|" + value + "}";
          },
          rich: {
            0: {
              backgroundColor: {
                image:
                  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADvSURBVHgBnZE9DgFBFMf/s4RQyJQKxWrUJBIlTuAIdKLCBWz2BKIQVIgLuAEXkFWr9gSyta/n2bWyn4r9JTOZNzO/mXlvgAQIX7QgFQqGPFsF4YwXZhgIM15yhAOPVM+6ib4oByXFIxgBAXa8pE60pGDKvUR0AnusaBqWIijmnfZlhDlV3SBt9w/oPPpMqjILdCt8bcbZYN2A3QXmNcP5/S53WZNsFNBrlqDlUqGnHvW6aIckzSDJJTa41CrCWJzHSKuLrT+nh/03UcIH+QI2kxNpfinNn8kn4g+C0HK2ftFrwuIn1sQztvwW3TFGUt6ELj4y91MpPAAAAABJRU5ErkJggg=="
              },
              height: 12,
              width: 12
            },
            1: {
              backgroundColor: {
                image:
                  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADvSURBVHgBnZE9DgFBFMf/s4RQyJQKxWrUJBIlTuAIdKLCBWz2BKIQVIgLuAEXkFWr9gSyta/n2bWyn4r9JTOZNzO/mXlvgAQIX7QgFQqGPFsF4YwXZhgIM15yhAOPVM+6ib4oByXFIxgBAXa8pE60pGDKvUR0AnusaBqWIijmnfZlhDlV3SBt9w/oPPpMqjILdCt8bcbZYN2A3QXmNcP5/S53WZNsFNBrlqDlUqGnHvW6aIckzSDJJTa41CrCWJzHSKuLrT+nh/03UcIH+QI2kxNpfinNn8kn4g+C0HK2ftFrwuIn1sQztvwW3TFGUt6ELj4y91MpPAAAAABJRU5ErkJggg=="
              },
              height: 12,
              width: 12
            },
            2: {
              backgroundColor: {
                image:
                  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADvSURBVHgBnZE9DgFBFMf/s4RQyJQKxWrUJBIlTuAIdKLCBWz2BKIQVIgLuAEXkFWr9gSyta/n2bWyn4r9JTOZNzO/mXlvgAQIX7QgFQqGPFsF4YwXZhgIM15yhAOPVM+6ib4oByXFIxgBAXa8pE60pGDKvUR0AnusaBqWIijmnfZlhDlV3SBt9w/oPPpMqjILdCt8bcbZYN2A3QXmNcP5/S53WZNsFNBrlqDlUqGnHvW6aIckzSDJJTa41CrCWJzHSKuLrT+nh/03UcIH+QI2kxNpfinNn8kn4g+C0HK2ftFrwuIn1sQztvwW3TFGUt6ELj4y91MpPAAAAABJRU5ErkJggg=="
              },
              height: 12,
              width: 12
            },
            3: {
              backgroundColor: {
                image:
                  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADvSURBVHgBnZE9DgFBFMf/s4RQyJQKxWrUJBIlTuAIdKLCBWz2BKIQVIgLuAEXkFWr9gSyta/n2bWyn4r9JTOZNzO/mXlvgAQIX7QgFQqGPFsF4YwXZhgIM15yhAOPVM+6ib4oByXFIxgBAXa8pE60pGDKvUR0AnusaBqWIijmnfZlhDlV3SBt9w/oPPpMqjILdCt8bcbZYN2A3QXmNcP5/S53WZNsFNBrlqDlUqGnHvW6aIckzSDJJTa41CrCWJzHSKuLrT+nh/03UcIH+QI2kxNpfinNn8kn4g+C0HK2ftFrwuIn1sQztvwW3TFGUt6ELj4y91MpPAAAAABJRU5ErkJggg=="
              },
              height: 12,
              width: 12
            },
            4: {
              backgroundColor: {
                image:
                  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADvSURBVHgBnZE9DgFBFMf/s4RQyJQKxWrUJBIlTuAIdKLCBWz2BKIQVIgLuAEXkFWr9gSyta/n2bWyn4r9JTOZNzO/mXlvgAQIX7QgFQqGPFsF4YwXZhgIM15yhAOPVM+6ib4oByXFIxgBAXa8pE60pGDKvUR0AnusaBqWIijmnfZlhDlV3SBt9w/oPPpMqjILdCt8bcbZYN2A3QXmNcP5/S53WZNsFNBrlqDlUqGnHvW6aIckzSDJJTa41CrCWJzHSKuLrT+nh/03UcIH+QI2kxNpfinNn8kn4g+C0HK2ftFrwuIn1sQztvwW3TFGUt6ELj4y91MpPAAAAABJRU5ErkJggg=="
              },
              height: 12,
              width: 12
            },
            5: {
              backgroundColor: {
                image:
                  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADvSURBVHgBnZE9DgFBFMf/s4RQyJQKxWrUJBIlTuAIdKLCBWz2BKIQVIgLuAEXkFWr9gSyta/n2bWyn4r9JTOZNzO/mXlvgAQIX7QgFQqGPFsF4YwXZhgIM15yhAOPVM+6ib4oByXFIxgBAXa8pE60pGDKvUR0AnusaBqWIijmnfZlhDlV3SBt9w/oPPpMqjILdCt8bcbZYN2A3QXmNcP5/S53WZNsFNBrlqDlUqGnHvW6aIckzSDJJTa41CrCWJzHSKuLrT+nh/03UcIH+QI2kxNpfinNn8kn4g+C0HK2ftFrwuIn1sQztvwW3TFGUt6ELj4y91MpPAAAAABJRU5ErkJggg=="
              },
              height: 12,
              width: 12
            },
            6: {
              backgroundColor: {
                image:
                  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADvSURBVHgBnZE9DgFBFMf/s4RQyJQKxWrUJBIlTuAIdKLCBWz2BKIQVIgLuAEXkFWr9gSyta/n2bWyn4r9JTOZNzO/mXlvgAQIX7QgFQqGPFsF4YwXZhgIM15yhAOPVM+6ib4oByXFIxgBAXa8pE60pGDKvUR0AnusaBqWIijmnfZlhDlV3SBt9w/oPPpMqjILdCt8bcbZYN2A3QXmNcP5/S53WZNsFNBrlqDlUqGnHvW6aIckzSDJJTa41CrCWJzHSKuLrT+nh/03UcIH+QI2kxNpfinNn8kn4g+C0HK2ftFrwuIn1sQztvwW3TFGUt6ELj4y91MpPAAAAABJRU5ErkJggg=="
              },
              height: 12,
              width: 12
            }
          }
        }
      }
    ],
    yAxis: {
      type: "value",
      name: "Unit ℃",
      nameTextStyle: {
        color: "#434792"
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: "#98B5C9",
            width:2
          
        }
      },
      axisLabel: {
        color: "#434792"
      }
    },
    series: [
      {
        name: "Real Time",
        type: "line",
        data: [20, 13, 11, 14, 9, 20, 21],
        lineStyle: {
          color: "#7AB8FB"
        },
        symbolSize: 6,
        itemStyle: {
          color: "#7AB8FB"
        },
        markLine:{
          data:{
            
          }
        }
      },
      {
        name: "Expected",
        type: "line",
        data: [20, 12, 11, 23, 20, 13, 10],
        lineStyle: {
          color: "#FF8401"
        },
        symbolSize: 6,
        itemStyle: {
          color: "#FF8401"
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(
            0,
            0,
            0,
            1,
            [
              {
                offset: 0,
                color: "rgba(230, 138, 53,0.3)"
              },
              {
                offset: 1,
                color: "rgba(230, 138, 53,0)"
              }
            ],
            false
          ),
          shadowBlur: 20
        }
      }
    ]
  };
  myChart.setOption(option);
};

onMounted(() => {
  init();
});
</script>
<style scoped>
.page-right-top {
  flex: 1;
  width: 100%;
  z-index: 9 !important;
  display: flex;
  flex-direction: column;
  font-size: 14px;
}

.page-right-top-title {
  flex: 1;
  position: relative;
  color: #3f3f8c;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.page-right-top-title .border {
  position: absolute;
  bottom: 23%;
  left: 0%;
  height: 1px;
  width: 32%;
  background: #3f3f8c;
}

.page-right-top-content {
  flex: 5;
}
</style> 