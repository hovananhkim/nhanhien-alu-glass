# Tiêu chuẩn UI — NhanHien

Tài liệu chuẩn cho mọi thay đổi giao diện trong dự án, tổng hợp từ `CODEX.md` và codebase ngày 30/09/2026. Các màn hình có chức năng tương đương phải dùng cùng biến thể UI, không tự chọn kích thước, màu hay vị trí riêng.

## 1. Phạm vi và cách áp dụng

- Đây là nguồn quy tắc UI chính, được dẫn chiếu từ [CODEX.md](CODEX.md). Khi quy tắc UI cũ khác tài liệu này, dùng tài liệu này. Yêu cầu cụ thể của người dùng vẫn được ưu tiên.
- Áp dụng chung cho Admin và Store về hệ màu, font, trạng thái, locales và khả năng truy cập. Bố cục nghiệp vụ Admin và bố cục tiếp thị Store là hai biến thể có chủ đích, quy định bên dưới.
- Các giá trị ghi là **chuẩn** là đích áp dụng, không phải khẳng định toàn bộ source đã đồng bộ. Lần cập nhật này chỉ tổng hợp tài liệu.
- Khi sửa UI, dùng CSS/component dùng chung; nếu chưa có primitive phù hợp, tách primitive để các màn hình cùng sử dụng. Không sao chép nhiều bộ class gần giống nhau rồi chỉnh từng trang.
- Ngoại lệ phải có lý do chức năng và được ghi tại đây; không tạo ngoại lệ chỉ vì đang làm một màn hình mới.

## 2. Căn cứ từ codebase và các điểm chưa đồng bộ

| Nguồn | Quy tắc kế thừa / điểm cần lưu ý |
| --- | --- |
| [tailwind.config.ts](tailwind.config.ts) | Palette `charcoal`, `wood`, font display/body và breakpoints Tailwind mặc định |
| [app/globals.css](app/globals.css) | Theme sáng/tối, `.form-input`, focus màu cam, `.admin-page-header`, các biến thể button Store |
| [Sản phẩm](app/(admin)/admin/products/page.tsx) và [EmployeesTable](components/admin/EmployeesTable.tsx) | Mẫu bảng danh sách: nền trắng, header viết hoa, badge, thao tác bên phải |
| [EmployeesManager](components/admin/EmployeesManager.tsx) | Field 40px, dropdown vừa nội dung, icon cách phải 12px, thanh lọc một hàng |
| [AttendanceTable](components/admin/AttendanceTable.tsx) | Biến thể bảng dày cột: ngày chia đều, tên/tổng cố định, cuộn trong bảng |
| [Blog](app/(admin)/admin/blog/page.tsx), [InventoryManager](components/admin/InventoryManager.tsx) | Nút tạo mới ở đầu trang, cùng `.admin-page-header` |
| [ProductForm](components/admin/ProductForm.tsx) | Focus đúng chuẩn; `.form-input` hiện tính chiều cao bằng padding, cần chuẩn hóa khi sửa form |
| [CategoryManager](components/admin/CategoryManager.tsx), [AdminGalleryClient](components/admin/AdminGalleryClient.tsx), [TestimonialsManager](components/admin/TestimonialsManager.tsx) | Form tạo mới hiển thị sẵn: nút submit cuối form, không phải nút mở luồng ở header |
| [UsersManager](components/admin/UsersManager.tsx) | Nút thao tác nhỏ; hiện còn padding/opacity riêng, cần chuyển sang biến thể compact |
| [ContactClient](components/store/ContactClient.tsx), [BulkOrdersClient](components/store/BulkOrdersClient.tsx) | Form Store và CTA dùng theme/`.btn-wood`, có biến thể toàn chiều rộng |

Các khác biệt hiện còn trong source cần xử lý khi chuẩn hóa:

- Button đang dùng `py-2`, `py-2.5`, `px-4` đến `px-7`, `rounded-lg` hoặc `rounded-xl`; chuẩn mới dùng chiều cao và padding rõ ràng theo vai trò.
- Input dùng `.form-input` có padding/font khác input `h-10` trong Nhân viên.
- Bảng Thanh toán và một số bảng nghiệp vụ vẫn có header xám/padding riêng; bảng danh sách thông thường cần theo mẫu Sản phẩm.
- `disabled:opacity-40`, `50`, `60` cùng tồn tại; chuẩn chung là 50%.
- Vẫn còn chuỗi hardcode tại một số màn hình, ví dụ bảng chấm công; cần chuyển vào locales khi sửa.
- Chưa có bộ primitive Button/Input/Table dùng chung toàn bộ dự án; các tên biến cục bộ như `control`, `input`, `EmployeeSelect` chưa phải component công khai dùng toàn hệ thống.

## 3. Token và màu sắc

Dùng token Tailwind/CSS có sẵn, không rải mã hex mới trong component.

| Vai trò | Chuẩn |
| --- | --- |
| Nền nội dung Admin | `bg-stone-50` |
| Card/bảng Admin | `bg-white`, viền `border-stone-100` |
| Tiêu đề | `text-charcoal-800` |
| Nội dung chính | `text-charcoal-700` |
| Label / nội dung phụ | `text-stone-600` / `text-stone-500` |
| Metadata theo bảng Sản phẩm | `text-stone-400`; không dùng cho lỗi hoặc thông tin bắt buộc |
| Nút chính Admin | `bg-charcoal-800` (#1c1917), `text-white` |
| Hover nút chính Admin | `bg-charcoal-900` (#0c0a09) |
| Focus Field | Viền `var(--accent)` và shadow `0 0 0 3px rgba(168,94,46,0.12)` |
| Thành công / đang hoạt động | `bg-green-50 text-green-700` |
| Lỗi / ngừng hoạt động | `bg-red-50 text-red-600` hoặc `text-red-700` cho thông báo |
| Cảnh báo | `bg-amber-50 text-amber-700` |
| Trung tính | `bg-stone-100 text-stone-600` |

Store sử dụng `--bg-*`, `--text-*`, `--border-*`, `--accent` để hỗ trợ theme. Không hardcode màu sáng lên màn hình tối. Màu focus dùng chung cho input, textarea, select; không dùng ring đen cho Field.

Màu có ý nghĩa nghiệp vụ phải kèm chữ, dấu hoặc icon. Riêng cột **Tổng kết cuối tháng**: số dương có dấu `+`, `text-green-700`; số âm có dấu `-`, `text-red-600`; số 0 không dấu, `text-stone-500`. Dùng `Intl` với `signDisplay: 'exceptZero'`, không thêm chữ “Còn phải trả”/“Đã trả dư” trong cột này. Không áp dụng quy ước này máy móc cho mọi chỉ số tài chính.

## 4. Kích thước và khoảng cách chuẩn

| Thành phần Admin | Chuẩn |
| --- | --- |
| Padding trang | `p-4 md:p-8` — 16px / 32px |
| Tiêu đề trang | `text-2xl font-display font-semibold` |
| Mô tả dưới tiêu đề | `text-sm mt-1` |
| Tiêu đề mục con | `text-lg font-semibold` |
| Body / control / button | `text-sm` — 14px |
| Metadata / header bảng | `text-xs` — 12px |
| Khoảng cách header → nội dung | 32px, do `.admin-page-header` quản lý |
| Khoảng cách giữa các section | 24px (`gap-6` / `space-y-6`) |
| Padding card/form/modal | 24px (`p-6`); màn hình nhỏ có thể `p-4` |
| Khoảng cách Field trong form | 16px (`gap-4` / `space-y-4`) |
| Khoảng cách label → control | 4px (`gap-1`), label `leading-5` |
| Khoảng cách bộ lọc / nhóm nút | 12px (`gap-3`) |
| Khoảng cách icon → chữ | 8px (`gap-2`) |
| Bo góc Field | 8px (`rounded-lg`) |
| Bo góc button thông thường | 12px (`rounded-xl`) |
| Bo góc card / bảng / modal | 16px (`rounded-2xl`) |

Không cộng chồng `mb-8` của header với margin của một container `space-y-*` lên cùng ranh giới. Chỉ một nơi quản lý khoảng cách giữa hai khối. Không dùng margin âm, `translate-y` hoặc offset riêng để sửa vị trí button.

## 5. Button: chiều cao, chiều rộng và trạng thái

| Biến thể | Chiều cao / padding | Mục đích |
| --- | --- | --- |
| Chính / phụ Admin | `h-10 px-5 py-0`, `text-sm font-medium rounded-xl` | Add, Lưu, Hủy, thao tác trang/form |
| Compact | `h-8 px-3 py-0`, `text-xs rounded-lg` | Thao tác bằng chữ trong dòng bảng |
| Chỉ icon | `h-8 w-8 p-0`, icon 15–16px, `rounded-md` | Xem/sửa/xóa trong dòng bảng |
| CTA / submit Store | Chuẩn đích `min-h-12 px-6`, cho chữ xuống dòng nếu cần | Liên hệ, gửi yêu cầu, mua hàng |

- Trong bảng ưu tiên nút chỉ icon 32×32px cho Xem/Sửa/Xóa, nhỏ hơn button cấp trang 40px. Ví dụ bảng Thanh toán dùng icon mắt cho Chi tiết và thùng rác cho Xóa; giữ tooltip và `aria-label` từ locales. Chỉ dùng nút compact có chữ khi icon không diễn đạt rõ hành động.
- Button/link dạng button dùng `inline-flex items-center justify-center gap-2`, không phụ thuộc line-height mặc định để tạo chiều cao.
- Width mặc định **theo nội dung + padding**, `w-auto shrink-0`; không cố định chiều dài khác nhau theo màn hình. Cùng nhãn và biến thể phải cùng kích thước.
- Không đặt mọi button `w-full` hay `flex-1`. Chỉ dùng toàn chiều rộng cho submit Store/auth hoặc nhóm lựa chọn được thiết kế bằng nhau.
- Nhóm Hủy/Lưu dùng cùng chiều cao và padding, không bắt buộc cùng chiều rộng khi độ dài nhãn khác nhau.
- Add/Lưu/Cập nhật Admin: nền đen, hover đen đậm; không dùng màu wood cho nút ADD.
- Nút phụ: nền trắng, `border border-stone-300 text-stone-600 hover:bg-stone-100`. Nút nguy hiểm dùng đỏ, chỉ cho hành động có tính hủy/xóa.
- `disabled` thật trên button, `disabled:opacity-50 disabled:cursor-not-allowed`. Khi lưu, khóa gửi trùng và giữ kích thước ổn định dù nhãn loading đổi.
- Transition màu 150–200ms. Button Admin không nhảy vị trí khi hover. Focus bàn phím phải nhìn thấy, không bỏ outline mà không có thay thế.
- Store dùng `.btn-primary`, `.btn-wood`, `.btn-outline` theo vai trò chung; CTA wood là biến thể thương hiệu, không phải lý do đổi nút Add Admin sang cam. Các class Store hiện chưa bảo đảm chiều cao chuẩn đích, cần điều chỉnh tại nguồn dùng chung khi triển khai.

## 6. Vị trí tương đối của thao tác

Thứ tự khối trong trang Admin:

1. Header: tiêu đề/mô tả bên trái, thao tác chính bên phải.
2. Thông báo của trang.
3. Thống kê nếu có.
4. Thanh lọc nếu có.
5. Bảng hoặc nội dung chính.

- Dùng `.admin-page-header`: `display:flex`, `align-items:flex-start`, `justify-content:space-between`, `gap:1rem`, `margin-bottom:2rem`.
- Nút Add căn **đầu tiêu đề**, không căn giữa theo cả tiêu đề + mô tả; không nằm cạnh bộ lọc hoặc dưới thẻ thống kê.
- Dưới 640px có thể xuống dòng, nút vẫn căn phải. Không để tiêu đề dài đẩy nút ra ngoài trang.
- Thông báo sau lưu nằm dưới header, không đẩy nút/tiêu đề xuống.
- Nút cấp mục con nằm bên phải tiêu đề mục con. Ví dụ Ghi nhận chi tiền phụ thuộc nhân viên đang chọn nên thuộc mục thanh toán của nhân viên đó.
- Footer form/modal căn phải: Hủy trước, Lưu/Thêm/Cập nhật sau; `gap-3`. Nút submit không chuyển lên header chỉ vì có chữ “Add”.
- Danh mục, Thư viện, Đánh giá có form thêm hiển thị sẵn: giữ submit cuối form.
- Thêm nhân viên chỉ xuất hiện ở Nhân viên → Tất cả; không xuất hiện ở Chấm công/Thanh toán. Nút tạo mới cấp trang khác nếu có vẫn dùng vị trí header chuẩn.
- Sửa hồ sơ nhân viên chỉ được mở từ Nhân viên → Tất cả (`/admin/employees`). Chấm công và Thanh toán chỉ hiển thị thông tin hồ sơ để tham chiếu; không có nút/link “Sửa hồ sơ” hoặc thao tác mở form sửa nhân viên.

## 7. Input, Field, dropdown và bộ lọc

### Field

- Input một dòng (`text`, `tel`, `number`, `date`, `month`) và select: **40px**, `h-10`, border 1px, `rounded-lg`, `text-sm`, `py-0`.
- Input thường `px-3`, form có thể `w-full min-w-0`. Label phía trên, `leading-5`, `gap-1`.
- Textarea là ngoại lệ nhiều dòng: `min-h-20 resize-y px-3 py-2`, cùng border/font/focus; không ép textarea về 40px.
- Dùng `.form-input` hoặc `.admin-field-control` để chia sẻ focus màu cam. Khi chuẩn hóa `.form-input`, kiểm tra CSS cascade: class này hiện có padding/font riêng, thêm `h-10` đơn thuần chưa đủ.
- Trạng thái lỗi phải có thông báo rõ ràng gắn với Field; giữ giá trị nhập khi lưu thất bại.

### Dropdown

- Theo mẫu `EmployeeSelect`: wrapper `relative block w-fit max-w-full`.
- Select `h-10 w-auto max-w-full appearance-none pl-3 pr-9 py-0`, độ rộng theo lựa chọn dài nhất, không tự giãn toàn hàng.
- Chevron hướng xuống **14px**, `absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none`, `aria-hidden="true"`.
- Mũi tên cách mép phải **12px**; khoảng đệm phải 36px dành chỗ cho icon và khoảng cách với chữ.
- Giữ tương tác bàn phím/native select; không để icon chặn click. Option dài phải được kiểm tra ở cả hai ngôn ngữ.

### Thanh tìm kiếm/lọc

- Một hàng: `flex flex-nowrap items-end gap-3`; màn hình hẹp `overflow-x-auto`, Field `shrink-0`.
- Width tham chiếu: tháng **176px** (`w-44`), tìm tên/điện thoại **208px** (`w-52`), dropdown `w-fit`/`w-auto`. Chỉ tăng khi dữ liệu hoặc bản dịch cần, không kéo giãn lấp cả hàng.
- Có nút tìm kiếm/reset thì cùng chiều cao 40px và căn đáy control, không căn theo label.
- Chừa khoảng trống quanh vùng focus để quầng cam 3px không bị cắt bởi vùng cuộn.
- Không tạo một kiểu dropdown/input riêng cho mỗi module.

## 8. Table và trạng thái danh sách

Mẫu bảng danh sách chuẩn là trang Sản phẩm và Nhân viên → Tất cả:

- Wrapper `bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden`; vùng con `overflow-x-auto`, `table w-full`.
- Header **nền trắng**, `border-b border-stone-100`; chữ `text-xs font-semibold text-stone-400 uppercase tracking-wider`.
- Cột đầu `px-6 py-4`, cột khác `px-4 py-4`. `tbody divide-y divide-stone-50`; dòng `hover:bg-stone-50 transition-colors`.
- Tên bản ghi `font-medium text-sm text-charcoal-800`; mô tả phụ `text-xs text-stone-400 mt-0.5`.
- Ảnh/chữ viết tắt nếu có: `w-12 h-12 rounded-lg bg-stone-100 shrink-0`, cách tên `gap-3`.
- Cột thao tác căn phải, các icon theo cùng thứ tự Xem → Sửa → Xóa nếu chức năng tồn tại. Không thêm API xóa chỉ để giống mẫu.
- Dữ liệu văn bản căn trái. Số đo/số tiền căn nhất quán cả header và body trong cùng cột; dùng `whitespace-nowrap` cho tiền/ngày để không gãy khó đọc.
- Badge trạng thái `text-xs px-2 py-0.5 rounded-full font-medium`, nhãn có ý nghĩa; không chỉ dùng chấm màu.
- Mobile giữ tên, trạng thái, thao tác; cột phụ có thể ẩn theo breakpoint. Không ẩn dữ liệu thiết yếu nếu không có cách xem chi tiết.
- Empty state nằm trong khung bảng, giải thích trống/chưa có kết quả theo ngữ cảnh. Giữ header và nút Add ở vị trí ổn định.
- `scope="col"`/`scope="row"` thích hợp; icon thao tác có `title`, `aria-label` từ locales.

### Ngoại lệ: bảng chấm công nhiều ngày

- Giữ thiết kế ma trận, không áp padding bảng danh sách khiến 31 cột tràn quá rộng.
- `w-full min-w-[760px] table-fixed text-xs`; cột nhân viên `w-32 xl:w-40`, cột tổng `w-14`, cột ngày chia đều; ngày `px-0 py-3`.
- Hai cột Nhân viên/Tổng công sticky trái/phải, nền không trong suốt; cuộn ngang chỉ bên trong bảng.
- Checkbox `h-3.5 w-3.5`, vùng label có chiều cao tối thiểu 24px; công lẻ giữ nguyên và hiện dưới checkbox.
- Mặc định lọc Đang làm; nhân viên đã nghỉ bị khóa checkbox. Tháng quá khứ chỉ xem, tháng tương lai không mở; tháng hiện tại theo giờ Việt Nam. API cũng phải bảo vệ giới hạn thời gian.
- Quy tắc giới hạn chấm công không được dùng để khóa nhầm chức năng thanh toán.

## 9. Responsive, theme và khả năng truy cập

- `main` Admin có `min-w-0`; nội dung dài không được đẩy cả layout rộng hơn viewport.
- Kiểm tra breakpoint 640/768/1024/1280px theo Tailwind. Khung Admin dùng sidebar nên phải tính chiều rộng còn lại, không chỉ chiều rộng màn hình.
- Tên dài có thể `truncate` kèm `title`/cách xem đầy đủ. Button dài không được cắt mất hành động.
- Không dùng `div` giả button; label phải liên kết control. Các icon trang trí `aria-hidden`, icon thao tác có tên truy cập.
- Modal có `role="dialog"`, `aria-modal`, tiêu đề liên kết, giới hạn chiều cao, cuộn nội bộ; quản lý focus và trả focus về nút mở khi đóng.
- Lỗi dùng `role="alert"`, thông báo lưu dùng `role="status"`. Không biến mọi thay đổi nhỏ thành popup.
- Phân biệt read-only với disabled; disabled không được tiếp tục gửi yêu cầu. Không chỉ dùng CSS mờ để ngăn thao tác.
- Kiểm tra độ rõ chữ/focus trong theme được hỗ trợ. Store dùng token theme; không sửa token toàn cục chỉ để chữa một màn hình Admin.

## Thông báo lưu và xác nhận xóa dùng chung

- Admin dùng `AdminFeedbackProvider` tại layout và hook `useAdminFeedback()` từ `components/admin/AdminFeedback.tsx`.
- Sau khi API lưu thành công, gọi `notify()` hoặc `notify(message)`; sau xóa dùng nhãn đã xóa. Không hiển thị banner “Đã lưu dữ liệu” trong luồng bố cục, không tạo toast riêng từng màn hình.
- Toast fixed góc trên bên phải, không đẩy nội dung; tự đóng sau 4 giây (lỗi 7 giây), có nút đóng và `role="status"`/`role="alert"`. Provider nằm ở layout nên toast vẫn tồn tại khi chuyển trang sau lưu.
- Toast gọn theo nội dung: `w-max`, tối đa `calc(100vw - 2rem)` trên mobile và `max-w-sm` từ 640px. Dùng `flex items-center gap-2 px-3 py-2.5`, chữ `text-sm leading-5`, nút đóng 24×24px. Toast một dòng cao khoảng 46px (giảm khoảng 30% so với mẫu 66px cũ); thông báo dài được xuống dòng, tăng chiều cao tự nhiên và vẫn căn giữa chữ/nút theo chiều dọc.
- Chỉ báo thành công sau khi kiểm tra HTTP response thành công. Lỗi chung dùng `notify(message, 'error')`; validation gắn Field/form có thể giữ inline để người dùng sửa đúng chỗ.
- Xóa bản ghi phải dùng `if (!(await confirmAction(message))) return` trước khi gọi API. Không dùng `window.confirm`, `confirm`, `alert` của trình duyệt hay cơ chế nhấn lại nút để xác nhận.
- Popup xác nhận dùng chung có tiêu đề, mô tả, Hủy và Xác nhận; focus ban đầu ở Hủy, Tab nằm trong popup, Escape tương đương Hủy, đóng trả focus về nút mở. Không có yêu cầu xóa trước khi xác nhận.
- Popup nghiệp vụ cần dữ liệu bổ sung (ví dụ lý do xóa vật tư) được giữ riêng; vẫn kiểm tra kết quả API và dùng toast chung. Không thay thế popup đó bằng xác nhận đơn giản làm mất trường bắt buộc.
- Chặn gửi trùng khi đang xử lý. Không dùng toast thành công để che lỗi API. Mọi nội dung thông báo và popup lấy từ locales.

```tsx
const { notify, confirmAction } = useAdminFeedback()
// Sau khi API lưu trả thành công:
notify()
// Trước khi gọi API xóa:
if (!(await confirmAction(t('admin.feedback.deleteMessage')))) return
```

## 10. Locales và nội dung

- Mọi text cố định lấy từ `locales/vi.json` và `locales/en.json` qua `t()` trong `lib/translations.ts`.
- Bao gồm tiêu đề, label, tên button/link, header bảng, dropdown, placeholder, trạng thái, empty state, lỗi/thành công, xác nhận, tooltip, `aria-label`, nội dung screen reader.
- Thêm đủ key hai ngôn ngữ, tên theo module; tái sử dụng key đúng ngữ nghĩa, không chỉ vì trùng chữ tạm thời.
- Câu có số/tên dùng cả câu trong locales với placeholder `{count}`, `{name}`, `{amount}`. Dùng callback khi thay dữ liệu người dùng để giữ ký tự đặc biệt.
- Tên/ghi chú do người dùng nhập, mã kỹ thuật, URL, enum, class CSS không dịch.
- Số, tiền, ngày dùng bộ định dạng phù hợp locale; không nối ký hiệu tiền tệ hardcode vào JSX. Tháng nghiệp vụ dùng múi giờ `Asia/Ho_Chi_Minh`.
- Không thay đổi trạng thái/giá trị API khi chỉ đổi nhãn hiển thị.

## 11. Quy trình áp dụng và kiểm tra

1. Đọc tài liệu này; xác định biến thể: Admin/Store, nút cấp trang/submit/mục con, bảng danh sách/ma trận.
2. Đối chiếu màn hình tương đương và class/component dùng chung trước khi thêm style.
3. Khi triển khai chuẩn hóa, ưu tiên primitive dùng chung cho button, Field/select, header, table; di chuyển các màn hình dùng cùng chức năng sang primitive đó theo cùng đợt.
4. Kiểm tra trạng thái thường, hover, focus bàn phím, disabled, loading, lỗi và rỗng; input/button cùng hàng phải cùng chiều cao.
5. Kiểm tra nội dung dài, bản dịch Việt/Anh, màn hình rộng/hẹp và theme liên quan; không cắt quầng focus hoặc làm tràn trang.
6. Rà soát toàn file UI đã sửa để tránh text hardcode và key dịch thiếu.
7. Thay đổi CSS đơn giản không cần viết test mô phỏng class; kiểm tra hiển thị phù hợp. Logic mới (ngày, giới hạn sửa, tổng tiền) cần kiểm thử nghiệp vụ.
8. Ghi rõ phần đã đồng bộ và phần còn khác chuẩn; không tuyên bố toàn bộ UI đã chuẩn hóa chỉ vì đã có tài liệu.

Khi thay đổi một giá trị chuẩn, cập nhật tài liệu này và nguồn CSS/component dùng chung trong cùng thay đổi; không ghi một bản quy tắc UI khác tại từng màn hình.
