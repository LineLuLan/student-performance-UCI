UI/UX Audit Log for Dashboard Optimization
1. Layout & Hierarchy: Lạm dụng khung viền (heavy borders) gây cảm giác bí bách; cần thay bằng white-space hoặc soft-shadow. Các thẻ KPIs hàng đầu bị lệch alignment so với các cột chart bên dưới; cần căn chỉnh lại padding và tăng font-size cho các con số tổng quát (Big Numbers) để tạo phân cấp thị giác.

2. Color & Semantics: Lỗi xung đột màu sắc (Color Semantic) tại cụm Clustering; việc dùng màu Đỏ cho nhóm "Social Risk" gây hiểu lầm là lỗi hệ thống hoặc cảnh báo nguy hiểm, cần chuyển sang tone trung tính (Teal/Indigo). Độ tương phản của các text phụ (xám trên trắng) quá thấp, không đảm bảo tính Accessibility.

3. Data Visualization Flaws: Biểu đồ Scatter Plot bị overlapping (chồng lấp dữ liệu) cực nặng, thiếu transparency khiến không thấy được mật độ. Biểu đồ Trajectory có quá nhiều đường lưới (gridlines) gây nhiễu thị giác. Confusion Matrix thiếu nhãn trục (Actual vs Predicted) rõ ràng.

4. Consistency: Thiếu đồng nhất về Font-weight giữa các tiêu đề. Các thành phần điều hướng (filter/button) ở góc trên bên phải chưa được căn lề chuẩn với biên của dashboard.