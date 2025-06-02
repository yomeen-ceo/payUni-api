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

| 名稱      | api           | 進度 |
|---------|---------------|----|
| 整合支付頁   | upp           | 完成 |
| 信用卡幕後   | credit        | 完成 |
| ATM     | atm           |    |
| 超商幕後    | CVS           |    |
| LINE幕後  | line          |    |
| AFTEE幕後 | aftee         |    |

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
#### /common/refund/

| 名稱       | api        | 進度 |
|----------|------------|----|
| 交易取消超商代碼 | cancel_cvs |    |
