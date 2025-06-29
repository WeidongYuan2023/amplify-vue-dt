
const baseUrl = "http://localhost:8000";
const request = (data) => {
  console.log(data);
}
// 根据建筑物ID获取模型
const getModel = (id: string) => {
  return `${baseUrl}/getModel?id=${id}`;
};


// 根据模型获取所有设备信息
const getDevices = (id: string) => {
  return getRequest("getDevices", id);
};

// 获取所有楼层及对应层的区域位置， 返回一个树形结构 {楼层： 【区域】}
const getBuildingInfo = (id: string) => {
  return getRequest("getBuildingInfo", id);
};

// 获取建筑物外观图片+房屋平面图
const getBuildingImage = (id: string) => {
  return getRequest("getBuildingImage", id);
};

// 点击设备 获取设备对应信息
const getAreaInfo = (id: string) => {
  return getRequest("getAreaInfo", id);
};

// 根据模型获取所有surface image
const getSurfaces = (id: string) => {
  return getRequest("getSurface", id);
};

// 根据模型获取所有Sensors
const getSensorList = (id) => {
  return request({
    url: `feature/getSensorList`,
    method: "get",
    params: { id },
  });
};

// 根据模型获取所有Sensors
const getSensor = (id: string) => {
  return request({
    url: `feature/getSensorDetail`,
    method: "get",
    params: { id },
  });
};

// 根据模型获取所有Robots
const getRobots = (id: string) => {
  return getRequest("getRobot", id);
};

const getImage = (id: string, type: string) => {
  return getRequest("getImage", id, type);
};

const getRequest = (endpoint: string, id = "", type = "") => {
  const url =
    `${baseUrl}/${endpoint}` +
    (id ? `?id=${id}` : "") +
    (type ? `&type=${type}` : "");
  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // 获取响应的Content-Type
    const contentType = response.headers.get("content-type");

    // 根据Content-Type返回不同格式的数据
    if (contentType?.includes("application/json")) {
      // JSON数据
      return response.json();
    } else if (contentType?.includes("model/gltf-binary")) {
      // GLB模型数据
      return response.arrayBuffer();
    } else if (contentType?.includes("image")) {
      // 图片数据
      return response.blob();
    } else {
      // 其他二进制数据
      return response.arrayBuffer();
    }
  });
};

export {
  getModel,
  getDevices,
  getBuildingInfo,
  getBuildingImage,
  getAreaInfo,
  getSurfaces,
  getSensorList,
  getSensor,
  getRobots,
  getImage,
};
