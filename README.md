# 專案名稱
payUni API

## 佈署平台
Google Cloud Run 

## 說明
1、目前版本單檔測試用，暫時用expressjs5.1
2、改用Google Cloud Secret Manager儲存
3、目前使用yomeen-payuni-api當service name，可替換，若要佈署可換名稱，目前npm run deploy是直接佈署到這個名稱

## 進度

### 交易建立
#### /payment

todo: 判斷載具類型util（共用）

| 名稱      | api    | 進度 |
|---------|--------|----|
| 整合支付頁   | upp    | 完成 |
| 信用卡幕後   | credit | 完成 |
| ATM     | atm    | 完成 |
| 超商幕後    | CVS    |    |
| LINE幕後  | line   |    |
| AFTEE幕後 | aftee  |    |

### 交易查詢
#### /trade

| 名稱     | api          | 進度 |
|--------|--------------|----|
| 單筆交易查詢 | query        | 完成 |
| 多筆交易查詢 | finite_query | 完成 |

### 交易請退款(credit)
#### /trade

| 名稱      | api    | 進度 |
|---------|--------|----|
| 交易請退款   | close  | 完成 |

### 交易取消(credit)
#### /trade

| 名稱     | api    | 進度 |
|--------|--------|----|
| 交易取消授權 | cancel | 完成 |

### 信用卡Token查詢(約定)(CREDIT)
#### /credit_bind

| 名稱     | api   | 進度 |
|--------|-------|----|
| 交易取消授權 | query |    |

### 信用卡Token取消(約定/記憶卡號)(CREDIT)
#### /credit_bind

| 名稱         | api    | 進度 |
|------------|--------|----|
| 信用卡Token取消 | cancel |    |

### 分段請求
#### /async

| 名稱   | api   | 進度 |
|------|-------|----|
| 分段請求 | async |    |

### 交易確認
#### /confirm

| 名稱  | api   | 進度 |
|-----|-------|----|
| 後支付 | aftee |    |

### 交易取消超商代碼(CVS)
#### /api

| 名稱       | api        | 進度 |
|----------|------------|----|
| 交易取消超商代碼 | cancel_cvs |    |

### 交易退款
#### /trade/common/refund

| 名稱           | api     | 進度 |
|--------------|---------|----|
| 愛金卡退款(ICASH) | icash   |    |
| 後支付退款(AFTEE) | aftee   |    |
| LINE Pay退款   | linepay |    |
| 街口支付退款       | jkopay  |    |

### 非信用卡退款轉匯
#### /trade/offline

| 名稱         | api           | 進度 |
|------------|---------------|----|
| 非信用卡退款轉匯   | refund        |    |
| 非信用卡退款轉匯取消 | cancel_refund |    |

### 撥款提領查詢
#### /trade

| 名稱   | api            | 進度 |
|------|----------------|----|
| 撥款查詢 | grant_query    |    |
| 提領查詢 | withdraw_query |    |

### 物流工具
#### /api/logistics

| 名稱            | api                  | 進度 |
|---------------|----------------------|----|
| 物流單修改(背景)     | update               |    |
| 物流單查詢         | query                |    |
| 建立超商物流單       | trade                |    |
| 超商門市地圖(前景)    | ship_map             |    |
| 超商出貨單列印(前景)   | print_label          |    |
| 退貨便要號         | refund               |    |
| 店到店物流單轉宅配資料提供 | c2c_to_home_delivery |    |

### 黑貓宅配物流
#### /home_delivery
| 名稱                  | api                | 進度 |
|---------------------|--------------------|----|
| 建立宅配單(背景)           | trade              |    |
| 產宅配編號並下載託運單PDF檔(前景) | get_obt_number_pdf |    |
| 下載託運單PDF檔(前景)       | download_pdf       |    |
| 呼叫黑貓(背景)            | call_cat           |    |
| 建立宅配退貨單(背景)         | refund             |    |

### 續期收款
#### /api/period

| 名稱           | api       | 進度 |
|--------------|-----------|----|
| 續期收款-支付頁     | Page      |    |
| 續期收款幕後       | /         |    |
| 續期收款狀態修改     | mdfStatus |    |
| 續期收款訂單內容修改   | Modify    |    |
| 續期收款訂單查詢     | query     |    |
| 續期收款卡號修改-幕後  | exchange  |    |
| 續期收款卡號修改-支付頁 | exchange  |    |


## Notify處理
| 名稱                           | 進度 |
|------------------------------|----|
| 整合式支付頁 UNiPaypage (UPP)      |    |
| 一頁收款 UNiOnepage (UOP) NOTIFY |    |
| 虛擬帳號付款通知(ATM Notify)         |    |
| 超商代碼付款通知                     |    |
| 訂單付款期限到期通知                   |    |
| 宅配貨態通知                       |    |
| 續期收款-每期授權完成通知                |    |
| 訂單電子發票開立結果通知                 |    |
