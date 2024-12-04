const Product = require("../models/product");
const Cart = require("../models/cart");
const Order = require("../models/order");
const User = require("../models/user");

// Get product data
exports.getProducts = (req, res, next) => {
  Product.find().then((data) => {
    res.status(200).json(data);
  });
};

// Get product by productID
exports.getProductById = (req, res, next) => {
  const productID = req.body.productID;
  Product.findById(productID).then((data) => {
    res.status(200).json(data);
  });
};

// Get all carts data
exports.getCarts = (req, res, next) => {
  Cart.find().then((data) => {
    res.status(200).json(data);
  });
};

// Get cart data of current user
exports.getCartOfCurrentUser = (req, res, next) => {
  const userID = req.body.userID;
  Cart.findOne({ userID: userID })
    .populate("cartData.productId")
    .then((data) => {
      // =============================================================================
      console.log("============ ID OF USER: =============: ", userID);
      console.log("============ Data for Cart =============: ", data);
      // =============================================================================

      if (data) {
        const cartOfCurrentUser = data.cartData.map((item) => {
          return { productItem: item.productId, quantity: item.quantity };
        });
        res.status(200).json({ userID: userID, cartData: cartOfCurrentUser });
      } else {
        res.status(200).json(null);
      }
    });
};

// Get cart data of current user
exports.getOrderOfCurrentUser = (req, res, next) => {
  const userID = req.body.userID;
  Order.find({ "user.userID": userID })
    .populate("products.productId")
    .then((data) => {
      // =============================================================================
      console.log("============ ID OF USER: =============: ", userID);
      console.log("============ Data for Order =============: ", data);
      // =============================================================================

      if (data) {
        res.status(200).json(data);
      } else {
        res.status(200).json(null);
      }
    });
};

// Get order by orderID
exports.getOrderByOrderID = (req, res, next) => {
  const orderID = req.body.orderID;
  if (orderID) {
    Order.findById(orderID)
      .populate("products.productId")
      .then((data) => {
        // =============================================================================
        console.log("============ ID OF ORDER: =============: ", orderID);
        console.log("======== Data for Order by OrderID =======: ", data);
        // =============================================================================

        if (data) {
          res.status(200).json(data);
        } else {
          res.status(200).json(null);
        }
      });
  } else {
    res.status(200).json(null);
  }
};

// Get all users for dashboard page in ADMIN-APP
exports.getAllUsers = (req, res, next) => {
  User.find()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      console.log("Error in get all users function: ", err);
      res.send({ message: err });
    });
};

// Get all transaction for dashboard page in ADMIN-APP
exports.getAllOrders = (req, res, next) => {
  Order.find()
    .then((data) => {
      // Sort trasactions by most recent order date
      const sortedData = data.sort((a, b) => b.updatedAt - a.updatedAt);
      res.status(200).json(sortedData);
    })
    .catch((err) => {
      console.log("Error in get all orders data function: ", err);
      res.send({ message: err });
    });
};

// // Get data for Searching                                                                                   ======> Có thể không cần dùng action này để lấy dữ liệu hotel mà dùng luôn dữ liệu hotel đã lưu trong context
// exports.getDataForSearching = async (req, res, next) => {
//   const searchParams = req.body.searchParams;
//   const city = searchParams.city.toLowerCase();
//   const dateStart = new Date(searchParams.dateStart).setHours(0, 0, 0, 0); // Đưa thời gian về 0 giờ, 0 phút, 0 giây, 0 miligiây của ngày để khi so sánh với ngày trong CSDL, nếu ngày này trùng với ngày trong CSDL thì nó sẽ bằng nhau mà ko bị lớn hơn ngày trong CSDL, vì ngày trong CSDL cũng lưu dưới dạng 0 giờ, 0 phút, 0 giây, 0 miligiây (nếu không dùng setHours(0,0,0,0) thì ngày so sánh sẽ lớn hơn do thời điểm so sánh đã qua thời điểm bắt đầu của ngày 0,0,0,0 nên phòng tuy đã bị đặt nhưng lại thành chưa bị đặt và dữ liệu phòng trống để đặt sẽ không chính xác)
//   const dateEnd = new Date(searchParams.dateEnd).setHours(0, 0, 0, 0); // Đưa thời gian về 0 giờ, 0 phút, 0 giây, 0 miligiây của ngày để khi so sánh với ngày trong CSDL, nếu ngày này trùng với ngày trong CSDL thì nó sẽ bằng nhau mà ko bị lớn hơn ngày trong CSDL, vì ngày trong CSDL cũng lưu dưới dạng 0 giờ, 0 phút, 0 giây, 0 miligiây (nếu không dùng setHours(0,0,0,0) thì ngày so sánh sẽ lớn hơn do thời điểm so sánh đã qua thời điểm bắt đầu của ngày 0,0,0,0 nên phòng tuy đã bị đặt nhưng lại thành chưa bị đặt và dữ liệu phòng trống để đặt sẽ không chính xác)
//   const totalPeople = searchParams.totalPeople;
//   const roomQuantity = searchParams.roomQuantity;
//   const minPrice = searchParams.minPrice;
//   const maxPrice = searchParams.maxPrice;

//   let bookedHotelsMatchCity = [],
//     bookedHotelsTimeNotOK,
//     hotelsWithNotAvailableRoom,
//     idRoomNotAvailable = [],
//     bookedRoom = [],
//     hotelsWithAvailableRoom,
//     availableHotels;

//   // Bước-1: Lọc ra các khách sạn ở thành phố muốn tìm
//   const hotelArr = await Hotel.find().populate("rooms");
//   const hotelsMatchCity = hotelArr.filter(
//     (item) => item.city.toLowerCase() === city
//   );

//   // Bước-2: Lọc ra các khách sạn mà trong thuộc tính "rooms" có loại phòng thoả mãn 2 điều kiện:
//   // + Có số người tối đa cho phòng >= số người cần đặt phòng: "maxPeople" >= "totalPeople"
//   // + Có số phòng >= số phòng cần đặt: "roomNumbers.length" >= "roomQuantity"
//   const hotelsMatchRoom = hotelsMatchCity.map((hotel) => {
//     const hotelObj = hotel.toObject(); // Dùng hotel.toObject() để chuyển "hotel" về đối tượng javascript thông thường, không chứa các thuộc tính mà mongoose tự sinh ra trong quá trình xử lý dữ liệu mà chỉ chứa các thuộc tính do lập trình viên tạo ra
//     const { ...rest } = hotelObj; // Dùng toán tử spread {...rest} = hotelObj: để lấy tất cả các thuộc tính trong "hotelObj"
//     return {
//       ...rest, // Sao chép các thuộc tính của "hotelObj", trong đó có thuộc tính "rooms" là một mảng

//       // Sửa lại giá trị của thuộc tính rooms: lọc ra các phần tử trong mảng "rooms" mà có thuộc tính "maxPeople" >= "totalPeople" và "roomNumbers.length" >= "roomQuantity"
//       rooms: hotel.rooms.filter(
//         (roomItem) =>
//           roomItem.maxPeople >= totalPeople &&
//           roomItem.roomNumbers.length >= roomQuantity
//       ),
//     };
//   });

//   // Bước-3("searchResult"???): Lọc ra những khách sạn có thuộc tính "rooms" có dữ liệu bên trong ("rooms" không phải là mảng rỗng)
//   const searchResult = hotelsMatchRoom.filter((item) => item.rooms.length > 0);

//   // =========================================================================================================

//   // Bước-4: Lấy dữ liệu từ collection("transaction"): CHỖ NÀY CẦN CHECK NẾU "transactionData = null" thì trả về nguyên mảng "searchResult"
//   const transactionData = await Transaction.find()
//     .populate("hotel")
//     .populate("rooms.roomID");

//   // =================================== Mới Thêm Vào =============================
//   if (transactionData.length === 0) {
//     availableHotels = searchResult;
//     return res.status(200).json({
//       availableHotels,
//     });
//   }
//   // ================================================================================

//   // Bước-4.1: Lọc ra trong "transactionData" những khách sạn đã được đặt (có thuộc tính "status" !== "Checkout") mà có vị trí ở thành phố mà người dùng muốn tìm (city of hotel = city)
//   if (transactionData.length > 0) {
//     bookedHotelsMatchCity = transactionData.filter(
//       (item) =>
//         item.hotel.city.toLowerCase() === city && item.status !== "Checkout"
//       // item.hotel.city.toLowerCase() === city
//     );
//   }

//   // Bước-4.2("bookedHotelsTimeNotOK"???): Lọc ra trong "bookedHotelsMatchCity" những khách sạn có thời gian đã đặt vi phạm vào thời gian của người dùng đang muốn đặt: có ("dateStart" thuộc transaction["dateStart", "dateEnd"]) hoặc ("dateEnd" thuộc transaction["dateStart", "dateEnd"]) hoặc ("dateStart" <= "dateStart" và "dateEnd" >= "dateEnd")
//   if (bookedHotelsMatchCity.length > 0) {
//     // Lấy các khách sạn đã được đặt phòng mà có khoảng thời gian checkin-checkout vi phạm vào thời gian người dùng đang muốn đặt
//     bookedHotelsTimeNotOK = bookedHotelsMatchCity.filter(
//       (item) =>
//         (dateStart >= item.dateStart.setHours(0, 0, 0, 0) &&
//           dateStart <= item.dateEnd.setHours(0, 0, 0, 0)) ||
//         (dateEnd >= item.dateStart.setHours(0, 0, 0, 0) &&
//           dateEnd <= item.dateEnd.setHours(0, 0, 0, 0)) ||
//         (dateStart <= item.dateStart.setHours(0, 0, 0, 0) &&
//           dateEnd >= item.dateEnd.setHours(0, 0, 0, 0))
//     );

//     // Bước-4.3: Lấy ra những khách sạn đã được đặt mà có loại phòng có số phòng trống < số phòng cần đặt
//     hotelsWithNotAvailableRoom = bookedHotelsTimeNotOK.map((item) => {
//       const transacObj = item.toObject();
//       const { ...rest } = transacObj;
//       return {
//         ...rest,
//         rooms: item.rooms.filter(
//           (i) => i.roomID.roomNumbers.length - i.roomOrder.length < roomQuantity
//         ),
//       };
//     });

//     // Bước-4.4: Lấy một mảng "idRoomNotAvailable" là giá trị các "_id" của những loại phòng có số phòng trống < số phòng cần đặt
//     hotelsWithNotAvailableRoom.map((item) =>
//       item.rooms.map((i) =>
//         idRoomNotAvailable.push({
//           hotelID: item.hotel._id.toString(),
//           roomID: i.roomID._id.toString(),
//         })
//       )
//     );

//     // Bước-4.5: Lọc ra trong "searchResult" các khách sạn có idRoom không thuộc mảng "idRoomNotAvailable" ("idRoomNotAvailable": là mảng các id room có số phòng trống < số phòng đặt)
//     // Kết quả là được dữ liệu gồm: Các khách sạn chưa được đặt phòng nào + Các khách sạn đã được đặt phòng và loại phòng đã đặt có số phòng còn trống vãn >= số phòng cần đặt
//     hotelsWithAvailableRoom = searchResult.map((item) => {
//       // TH-1: HotelID trong "searchResult" KHÔNG CÓ trong mảng "idRoomNotAvailable"
//       if (
//         !idRoomNotAvailable.map((i) => i.hotelID).includes(item._id.toString())
//       ) {
//         return item;
//       }

//       // TH-2: HotelID trong "searchResult" CÓ trong mảng "idRoomNotAvailable"
//       if (
//         idRoomNotAvailable.map((i) => i.hotelID).includes(item._id.toString())
//       ) {
//         return {
//           ...item,
//           rooms: item.rooms.filter(
//             (i) =>
//               !idRoomNotAvailable
//                 .map((j) => j.roomID)
//                 .includes(i._id.toString())
//           ),
//         };
//       }
//     });

//     // Bước-4.6: Loại bỏ từ "hotelsWithAvailableRoom" các khách sạn có thuộc tính "rooms" là một mảng trống (rooms = [])
//     hotelsWithAvailableRoom = hotelsWithAvailableRoom.filter(
//       (item) => item.rooms.length > 0
//     );

//     // Bước-4.7: Lấy ra từ "bookedHotelsTimeNotOK" các khách sạn đã được đặt phòng, nhưng có loại phòng được đặt vẫn còn số phòng trống >= số phòng cần đặt
//     // Rồi từ dữ liệu vừa lấy ra, ta sẽ tạo một mảng "bookedRoom" có các phần tử với các thuộc tính là {hotelID: "value", roomID:"value", roomOrder: "value"}, trong đó:
//     // hotelID: là "id" của khách sạn đã được đặt phòng, nhưng loại phòng đã đặt còn số phòng trống >= số phòng cần đặt
//     // roomID: là "id" của loại phòng đã được đặt của khách sạn mà loại phòng này vẫn còn số phòng trống >= số phòng cần đặt
//     // roomOrder: là mảng chứa các giá trị là số hiệu của các phòng đã được đặt có trong loại phòng tương ứng với "id" nằm trong thuộc tính "roomID" của mảng "bookedRoom"
//     bookedHotelsTimeNotOK.map((item) => {
//       item.rooms.map((i) => {
//         bookedRoom.push({
//           hotelID: item.hotel._id.toString(),
//           roomID: i.roomID._id.toString(),
//           roomOrder: i.roomOrder,
//         });
//       });
//     });

//     // Bước-5: Loại bỏ trong "hotelWithAvailableRoom" tất cả các phòng đã được đặt của các loại phòng trong từng khách sạn (những phòng đã được đặt trong "hotelsWithAvailableRoom" là những phòng có tên trong thuộc tính "roomOrder" của mảng "bookedRoom")
//     availableHotels = hotelsWithAvailableRoom.map((item) => {
//       return {
//         ...item,
//         rooms: item.rooms.map((i) => {
//           const iObj = i.toObject();
//           const { ...rest } = iObj;

//           // TH-1:
//           // Nếu trong "hotelWithAvailableRoom" các hotel "KHÔNG CÓ" mặt trong thuộc tính "hotelID" của mảng "bookedRoom" là mảng các khách sạn có phòng đã đặt
//           // thì những khách sạn như thế sẽ đủ điểu kiện (city-OK, maxPeople-OK, phòng trống-OK) để được đặt phòng
//           // nên sẽ trả nguyên toàn bộ khách sạn đó với các thuộc tính của nó
//           if (
//             !bookedRoom
//               .map((iPhong) => iPhong.hotelID)
//               .includes(item._id.toString())
//           ) {
//             return {
//               ...rest,
//               roomNumbers: i.roomNumbers,
//             };
//           }

//           // TH-2:
//           // Nếu trong "hotelWithAvailableRoom" các hotel "CÓ" mặt trong thuộc tính "hotelID"
//           // nhưng các loại phòng không có mặt trong thuộc tính "roomID" của mảng "bookedRoom" là mảng các khách sạn có phòng đã đặt
//           // thì những khách sạn như thế sẽ đủ điểu kiện (city-OK, maxPeople-OK, phòng trống-OK) để được đặt phòng
//           // nên sẽ trả nguyên toàn bộ khách sạn đó với các thuộc tính của nó
//           if (
//             bookedRoom
//               .map((iPhong) => iPhong.hotelID)
//               .includes(item._id.toString()) &&
//             !bookedRoom
//               .map((iPhong) => iPhong.roomID)
//               .includes(i._id.toString())
//           ) {
//             return {
//               ...rest,
//               roomNumbers: i.roomNumbers,
//             };
//           }

//           // TH-3:
//           // Nếu trong "hotelWithAvailableRoom" các hotel "CÓ" mặt trong thuộc tính "hotelID"
//           // và các loại phòng không "CÓ" mặt trong thuộc tính "roomID" của mảng "bookedRoom" là mảng các khách sạn có phòng đã đặt
//           // thì những khách sạn như thế sẽ phải loại bỏ các phòng đã được đặt (tên phòng có mặt trong mảng thuộc tính "roomOrder" của mảng "bookedRoom")
//           // và chỉ để lại các phòng chưa đặt (tên phòng không có mặt trong thuộc tính "roomOrder" của mảng "bookedRoom")
//           // nên sẽ trả nguyên toàn bộ khách sạn đó với các thuộc tính của nó
//           if (
//             bookedRoom
//               .map((iPhong) => iPhong.hotelID)
//               .includes(item._id.toString()) &&
//             bookedRoom.map((iPhong) => iPhong.roomID).includes(i._id.toString())
//           ) {
//             // ====================================================================================
//             // Với hotel hiện tại, tìm trong "bookedRoom" tìm tất cả các item có "hotelID" và "roomID" trùng với hotel hiện tại trong "hotelsWithAvailableRoom"
//             // rồi truy cập vào thuộc tính "roomOrder" để nhặt ra các tên phòng đã được đặt rồi đẩy tên các phòng đó vào một mảng "roomInBooking" là mảng các phòng đã được đặt
//             const roomInBooking = [];
//             bookedRoom.map((iPhong) => {
//               if (
//                 iPhong.hotelID === item._id.toString() &&
//                 iPhong.roomID === i._id.toString()
//               ) {
//                 iPhong.roomOrder.map((k) => roomInBooking.push(k));
//               }
//             });

//             console.log(
//               "========== ROOM IN BOOKING ==========: ",
//               roomInBooking
//             );
//             // ====================================================================================

//             // Giữ lại những phòng mà không nằm trong mảng các phòng đã đặt "roomInBooking"
//             // (tức là loại bỏ các phòng mà nằm trong mảng các phòng đã đặt "roomInBooking")
//             return {
//               ...rest,
//               roomNumbers: i.roomNumbers.filter(
//                 (j) => !roomInBooking.includes(j)
//               ),
//             };
//           }
//         }),
//       };
//     });

//     // =================================== CẦN XEM LẠI CHỖ NÀY ======================================================
//     // Lọc bỏ các phần tử trong mảng "availableHotels" mà có thuộc tính "roomNumbers" là mảng rỗng (không có phòng nào trống)
//     availableHotels = availableHotels.map((i) => ({
//       ...i,
//       rooms: i.rooms.filter((j) => j.roomNumbers.length > 0),
//     }));

//     // Lọc bỏ các phần tử trong mảng "availableHotels" mà có thuộc tính "roomNumbers" là mảng rỗng (không có phòng nào trống)
//     availableHotels = availableHotels.filter((item) => item.rooms.length > 0);
//   } else {
//     availableHotels = searchResult;
//   }

//   // Bước-6: Nếu tham số search có "minPrice" và "maxPrice":
//   // Lọc ra từ kết quả cuối cùng những khách sạn có thuộc tính "price" CỦA KHÁCH SẠN thoả mãn: "minPrice" <= price <= "maxPrice"
//   if (minPrice > 0 && maxPrice > 0) {
//     // Lọc ra các khách sạn có thuộc tính cheapestPrice thoả mãn: minPrice <= cheapestPrice <= maxPrice
//     availableHotels = availableHotels.filter(
//       (item) => item.cheapestPrice >= minPrice && item.cheapestPrice <= maxPrice
//     );

//     // // Lọc ra các khách sạn có thuộc tính "rooms" là mảng có dữ liệu (tức là Loại bỏ các khách sạn có thuộc tính rooms là mảng trống, không có dữ liệu)
//     // availableHotels = availableHotels.filter((item) => item.rooms.length > 0);
//   }

//   res.status(200).json({
//     availableHotels,
//   });
// };

// // Get details of Hotel
// exports.getHotelDetails = (req, res, next) => {
//   const hotelID = req.body.hotelID;
//   Hotel.findById(hotelID)
//     .populate("rooms")
//     .then((data) => {
//       // =====================================================================
//       console.log("============ Hotel Data Detail ==============: ", data);
//       // =====================================================================
//       res.status(200).json(data);
//     })
//     .catch((err) => console.log("Error in get details of hotel: ", err));
// };

// // Get room by roomID
// exports.getRoomByID = (req, res, next) => {
//   const roomID = req.body.roomID;
//   Room.findById(roomID)
//     .then((data) => {
//       // =====================================================================
//       console.log("============ Room ID ==============: ", roomID);
//       console.log("============ Room Information ==============: ", data);
//       // =====================================================================
//       res.status(200).json(data);
//     })
//     .catch((err) => console.log("Error in get room by roomID: ", err));
// };

// // Get data for transaction-dashboard page in CLIENT-APP (by email of user)
// exports.getTransactionDataByEmail = (req, res, next) => {
//   const userEmail = req.body.userEmail;
//   Transaction.find({ "user.email": userEmail })
//     .populate("hotel", "name-_id")
//     .then((data) => {
//       res.status(200).json(data);
//     })
//     .catch((err) => {
//       console.log("Error Information: ", err);
//       res.send({ message: err });
//     });
// };

// // Get all users for dashboard page in ADMIN-APP
// exports.getAllRooms = (req, res, next) => {
//   Room.find()
//     .then((data) => {
//       res.status(200).json(data);
//     })
//     .catch((err) => {
//       console.log("Error in get all rooms function: ", err);
//       res.send({ message: err });
//     });
// };
