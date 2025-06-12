# 專案名稱
payUni API

## 佈署平台
Google Cloud Run 

## 說明
1、目前版本單檔測試用，暫時用expressjs5.1
2、改用Google Cloud Secret Manager儲存
3、目前使用yomeen-payuni-api當service name，可替換，若要佈署可換名稱，目前npm run deploy是直接佈署到這個名稱

---

---

# 進度

--- 

## 交易建立

### /payment

"綁定"信用卡token用法 
1、在信用卡幕後交易request帶入creditToken
2、從response中取得CreditHash存入資料庫
A、後續該會員可不用再輸入信用卡資訊，送出信用卡幕後時不用帶信用卡資訊，只需要creditHash
B、可由/v1/credit_bind/query用「creditToken」或「creditHash」查詢相關資訊
C、可用/v1/credit_bind/cancel帶入「CreditHash」取消綁定，
*註：沒找到「記憶」信用卡號相關api，只看到綁定的

todo: 判斷載具類型util（共用）

| 名稱      | api                 | 進度 |
|---------|---------------------|----|
| 整合支付頁   | /v1/payment/upp     | 完成 |
| 信用卡幕後   | /v1/payment/credit  | 完成 |
| ATM     | /v1/payment/atm     | 完成 |
| 超商幕後    | /v1/payment/cvs     | 完成 |
| LINE幕後  | /v1/payment/linepay | 完成 |
| AFTEE幕後 | /v1/payment/aftee   | 完成 |

---

## 交易查詢、確認、取消、退款
#### /trade

### 查詢

| 名稱     | api                    | 進度 |
|--------|------------------------|----|
| 單筆交易查詢 | /v1/trade/query        | 完成 |
| 多筆交易查詢 | /v1/trade/finite-query | 完成 |

| 名稱   | api                      | 進度 |
|------|--------------------------|----|
| 撥款查詢 | /v1/trade/grant_query    |    |
| 提領查詢 | /v1/trade/withdraw_query |    |

### 確認

| 名稱             | api                     | 進度 |
|----------------|-------------------------|----|
| 後支付交易確認(aftee) | /v1/trade/confirm/aftee | 完成 |

### 取消

| 名稱            | api                     | 進度 |
|---------------|-------------------------|----|
| 信用卡交易取消授權     | /v1/trade/cancel/credit | 完成 |
| 交易取消超商代碼(cvs) | /v1/trade/cancel/cvs    | 完成 |

### 退款

| 名稱        | api                    | 進度 |
|-----------|------------------------|----|
| 信用卡交易請退款  | /v1/trade/close/credit | 完成 |

| 名稱           | api                         | 進度 |
|--------------|-----------------------------|----|
| 後支付退款(AFTEE) | /v1/trade/refund/aftee      | 完成 |
| 愛金卡退款(ICASH) | /v1/trade/refund/icash      |    |
| LINE Pay退款   | /v1/trade/refund/linepay    |    |
| 街口支付退款       | /v1/trade/refund/jkopay     |    |
| 非信用卡退款轉匯     | /v1/trade/refund/not-credit |    |

### 取消退款

| 名稱         | api                                | 進度 |
|------------|------------------------------------|----|
| 非信用卡退款轉匯取消 | /v1/trade/cancel_refund/not-credit |    |


---

## 信用卡綁定相關api
### /credit_bind

#### 信用卡Token查詢(約定)(CREDIT)

| 名稱     | api   | 進度 |
|--------|-------|----|
| 交易取消授權 | query | 完成 |

#### 信用卡Token取消(約定/記憶卡號)(CREDIT)

| 名稱         | api                    | 進度 |
|------------|------------------------|----|
| 信用卡Token取消 | /v1/credit_bind/cancel | 完成 |

---

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

---

### 分段請求
#### /async

*目前沒有覺得有必要用這個功能，先暫緩串接

| 名稱   | api   | 進度 |
|------|-------|----|
| 分段請求 | async |    |

---

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


---


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
