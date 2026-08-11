# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetCampaign*](#getcampaign)
  - [*ListCampaigns*](#listcampaigns)
  - [*GetLandingPage*](#getlandingpage)
  - [*ListLandingPages*](#listlandingpages)
  - [*GetLead*](#getlead)
  - [*ListLeads*](#listleads)
  - [*GetCallToAction*](#getcalltoaction)
  - [*ListCallToActions*](#listcalltoactions)
  - [*GetAnalyticsEvent*](#getanalyticsevent)
  - [*ListAnalyticsEvents*](#listanalyticsevents)
- [**Mutations**](#mutations)
  - [*CreateCampaign*](#createcampaign)
  - [*UpdateCampaign*](#updatecampaign)
  - [*DeleteCampaign*](#deletecampaign)
  - [*CreateLandingPage*](#createlandingpage)
  - [*UpdateLandingPage*](#updatelandingpage)
  - [*DeleteLandingPage*](#deletelandingpage)
  - [*CreateLead*](#createlead)
  - [*UpdateLead*](#updatelead)
  - [*DeleteLead*](#deletelead)
  - [*CreateCallToAction*](#createcalltoaction)
  - [*UpdateCallToAction*](#updatecalltoaction)
  - [*DeleteCallToAction*](#deletecalltoaction)
  - [*CreateAnalyticsEvent*](#createanalyticsevent)
  - [*DeleteAnalyticsEvent*](#deleteanalyticsevent)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetCampaign
You can execute the `GetCampaign` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getCampaign(vars: GetCampaignVariables, options?: ExecuteQueryOptions): QueryPromise<GetCampaignData, GetCampaignVariables>;

interface GetCampaignRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCampaignVariables): QueryRef<GetCampaignData, GetCampaignVariables>;
}
export const getCampaignRef: GetCampaignRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCampaign(dc: DataConnect, vars: GetCampaignVariables, options?: ExecuteQueryOptions): QueryPromise<GetCampaignData, GetCampaignVariables>;

interface GetCampaignRef {
  ...
  (dc: DataConnect, vars: GetCampaignVariables): QueryRef<GetCampaignData, GetCampaignVariables>;
}
export const getCampaignRef: GetCampaignRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCampaignRef:
```typescript
const name = getCampaignRef.operationName;
console.log(name);
```

### Variables
The `GetCampaign` query requires an argument of type `GetCampaignVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetCampaignVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetCampaign` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCampaignData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetCampaignData {
  campaign?: {
    name: string;
    startDate: DateString;
    budget?: number | null;
  };
}
```
### Using `GetCampaign`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCampaign, GetCampaignVariables } from '@dataconnect/generated';

// The `GetCampaign` query requires an argument of type `GetCampaignVariables`:
const getCampaignVars: GetCampaignVariables = {
  id: ..., 
};

// Call the `getCampaign()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCampaign(getCampaignVars);
// Variables can be defined inline as well.
const { data } = await getCampaign({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCampaign(dataConnect, getCampaignVars);

console.log(data.campaign);

// Or, you can use the `Promise` API.
getCampaign(getCampaignVars).then((response) => {
  const data = response.data;
  console.log(data.campaign);
});
```

### Using `GetCampaign`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCampaignRef, GetCampaignVariables } from '@dataconnect/generated';

// The `GetCampaign` query requires an argument of type `GetCampaignVariables`:
const getCampaignVars: GetCampaignVariables = {
  id: ..., 
};

// Call the `getCampaignRef()` function to get a reference to the query.
const ref = getCampaignRef(getCampaignVars);
// Variables can be defined inline as well.
const ref = getCampaignRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCampaignRef(dataConnect, getCampaignVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.campaign);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.campaign);
});
```

## ListCampaigns
You can execute the `ListCampaigns` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listCampaigns(options?: ExecuteQueryOptions): QueryPromise<ListCampaignsData, undefined>;

interface ListCampaignsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCampaignsData, undefined>;
}
export const listCampaignsRef: ListCampaignsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listCampaigns(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListCampaignsData, undefined>;

interface ListCampaignsRef {
  ...
  (dc: DataConnect): QueryRef<ListCampaignsData, undefined>;
}
export const listCampaignsRef: ListCampaignsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listCampaignsRef:
```typescript
const name = listCampaignsRef.operationName;
console.log(name);
```

### Variables
The `ListCampaigns` query has no variables.
### Return Type
Recall that executing the `ListCampaigns` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListCampaignsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListCampaignsData {
  campaigns: ({
    name: string;
    budget?: number | null;
  })[];
}
```
### Using `ListCampaigns`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listCampaigns } from '@dataconnect/generated';


// Call the `listCampaigns()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listCampaigns();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listCampaigns(dataConnect);

console.log(data.campaigns);

// Or, you can use the `Promise` API.
listCampaigns().then((response) => {
  const data = response.data;
  console.log(data.campaigns);
});
```

### Using `ListCampaigns`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listCampaignsRef } from '@dataconnect/generated';


// Call the `listCampaignsRef()` function to get a reference to the query.
const ref = listCampaignsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listCampaignsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.campaigns);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.campaigns);
});
```

## GetLandingPage
You can execute the `GetLandingPage` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getLandingPage(vars: GetLandingPageVariables, options?: ExecuteQueryOptions): QueryPromise<GetLandingPageData, GetLandingPageVariables>;

interface GetLandingPageRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLandingPageVariables): QueryRef<GetLandingPageData, GetLandingPageVariables>;
}
export const getLandingPageRef: GetLandingPageRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getLandingPage(dc: DataConnect, vars: GetLandingPageVariables, options?: ExecuteQueryOptions): QueryPromise<GetLandingPageData, GetLandingPageVariables>;

interface GetLandingPageRef {
  ...
  (dc: DataConnect, vars: GetLandingPageVariables): QueryRef<GetLandingPageData, GetLandingPageVariables>;
}
export const getLandingPageRef: GetLandingPageRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getLandingPageRef:
```typescript
const name = getLandingPageRef.operationName;
console.log(name);
```

### Variables
The `GetLandingPage` query requires an argument of type `GetLandingPageVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetLandingPageVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetLandingPage` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetLandingPageData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetLandingPageData {
  landingPage?: {
    title: string;
    slug: string;
    status: string;
  };
}
```
### Using `GetLandingPage`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getLandingPage, GetLandingPageVariables } from '@dataconnect/generated';

// The `GetLandingPage` query requires an argument of type `GetLandingPageVariables`:
const getLandingPageVars: GetLandingPageVariables = {
  id: ..., 
};

// Call the `getLandingPage()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getLandingPage(getLandingPageVars);
// Variables can be defined inline as well.
const { data } = await getLandingPage({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getLandingPage(dataConnect, getLandingPageVars);

console.log(data.landingPage);

// Or, you can use the `Promise` API.
getLandingPage(getLandingPageVars).then((response) => {
  const data = response.data;
  console.log(data.landingPage);
});
```

### Using `GetLandingPage`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getLandingPageRef, GetLandingPageVariables } from '@dataconnect/generated';

// The `GetLandingPage` query requires an argument of type `GetLandingPageVariables`:
const getLandingPageVars: GetLandingPageVariables = {
  id: ..., 
};

// Call the `getLandingPageRef()` function to get a reference to the query.
const ref = getLandingPageRef(getLandingPageVars);
// Variables can be defined inline as well.
const ref = getLandingPageRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getLandingPageRef(dataConnect, getLandingPageVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.landingPage);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.landingPage);
});
```

## ListLandingPages
You can execute the `ListLandingPages` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listLandingPages(options?: ExecuteQueryOptions): QueryPromise<ListLandingPagesData, undefined>;

interface ListLandingPagesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListLandingPagesData, undefined>;
}
export const listLandingPagesRef: ListLandingPagesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listLandingPages(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListLandingPagesData, undefined>;

interface ListLandingPagesRef {
  ...
  (dc: DataConnect): QueryRef<ListLandingPagesData, undefined>;
}
export const listLandingPagesRef: ListLandingPagesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listLandingPagesRef:
```typescript
const name = listLandingPagesRef.operationName;
console.log(name);
```

### Variables
The `ListLandingPages` query has no variables.
### Return Type
Recall that executing the `ListLandingPages` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListLandingPagesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListLandingPagesData {
  landingPages: ({
    title: string;
    slug: string;
    status: string;
  })[];
}
```
### Using `ListLandingPages`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listLandingPages } from '@dataconnect/generated';


// Call the `listLandingPages()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listLandingPages();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listLandingPages(dataConnect);

console.log(data.landingPages);

// Or, you can use the `Promise` API.
listLandingPages().then((response) => {
  const data = response.data;
  console.log(data.landingPages);
});
```

### Using `ListLandingPages`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listLandingPagesRef } from '@dataconnect/generated';


// Call the `listLandingPagesRef()` function to get a reference to the query.
const ref = listLandingPagesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listLandingPagesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.landingPages);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.landingPages);
});
```

## GetLead
You can execute the `GetLead` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getLead(vars: GetLeadVariables, options?: ExecuteQueryOptions): QueryPromise<GetLeadData, GetLeadVariables>;

interface GetLeadRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLeadVariables): QueryRef<GetLeadData, GetLeadVariables>;
}
export const getLeadRef: GetLeadRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getLead(dc: DataConnect, vars: GetLeadVariables, options?: ExecuteQueryOptions): QueryPromise<GetLeadData, GetLeadVariables>;

interface GetLeadRef {
  ...
  (dc: DataConnect, vars: GetLeadVariables): QueryRef<GetLeadData, GetLeadVariables>;
}
export const getLeadRef: GetLeadRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getLeadRef:
```typescript
const name = getLeadRef.operationName;
console.log(name);
```

### Variables
The `GetLead` query requires an argument of type `GetLeadVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetLeadVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetLead` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetLeadData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetLeadData {
  lead?: {
    email: string;
    firstName?: string | null;
    company?: string | null;
  };
}
```
### Using `GetLead`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getLead, GetLeadVariables } from '@dataconnect/generated';

// The `GetLead` query requires an argument of type `GetLeadVariables`:
const getLeadVars: GetLeadVariables = {
  id: ..., 
};

// Call the `getLead()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getLead(getLeadVars);
// Variables can be defined inline as well.
const { data } = await getLead({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getLead(dataConnect, getLeadVars);

console.log(data.lead);

// Or, you can use the `Promise` API.
getLead(getLeadVars).then((response) => {
  const data = response.data;
  console.log(data.lead);
});
```

### Using `GetLead`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getLeadRef, GetLeadVariables } from '@dataconnect/generated';

// The `GetLead` query requires an argument of type `GetLeadVariables`:
const getLeadVars: GetLeadVariables = {
  id: ..., 
};

// Call the `getLeadRef()` function to get a reference to the query.
const ref = getLeadRef(getLeadVars);
// Variables can be defined inline as well.
const ref = getLeadRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getLeadRef(dataConnect, getLeadVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.lead);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.lead);
});
```

## ListLeads
You can execute the `ListLeads` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listLeads(options?: ExecuteQueryOptions): QueryPromise<ListLeadsData, undefined>;

interface ListLeadsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListLeadsData, undefined>;
}
export const listLeadsRef: ListLeadsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listLeads(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListLeadsData, undefined>;

interface ListLeadsRef {
  ...
  (dc: DataConnect): QueryRef<ListLeadsData, undefined>;
}
export const listLeadsRef: ListLeadsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listLeadsRef:
```typescript
const name = listLeadsRef.operationName;
console.log(name);
```

### Variables
The `ListLeads` query has no variables.
### Return Type
Recall that executing the `ListLeads` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListLeadsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListLeadsData {
  leads: ({
    email: string;
    firstName?: string | null;
    submittedAt: TimestampString;
  })[];
}
```
### Using `ListLeads`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listLeads } from '@dataconnect/generated';


// Call the `listLeads()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listLeads();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listLeads(dataConnect);

console.log(data.leads);

// Or, you can use the `Promise` API.
listLeads().then((response) => {
  const data = response.data;
  console.log(data.leads);
});
```

### Using `ListLeads`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listLeadsRef } from '@dataconnect/generated';


// Call the `listLeadsRef()` function to get a reference to the query.
const ref = listLeadsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listLeadsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.leads);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.leads);
});
```

## GetCallToAction
You can execute the `GetCallToAction` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getCallToAction(vars: GetCallToActionVariables, options?: ExecuteQueryOptions): QueryPromise<GetCallToActionData, GetCallToActionVariables>;

interface GetCallToActionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCallToActionVariables): QueryRef<GetCallToActionData, GetCallToActionVariables>;
}
export const getCallToActionRef: GetCallToActionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCallToAction(dc: DataConnect, vars: GetCallToActionVariables, options?: ExecuteQueryOptions): QueryPromise<GetCallToActionData, GetCallToActionVariables>;

interface GetCallToActionRef {
  ...
  (dc: DataConnect, vars: GetCallToActionVariables): QueryRef<GetCallToActionData, GetCallToActionVariables>;
}
export const getCallToActionRef: GetCallToActionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCallToActionRef:
```typescript
const name = getCallToActionRef.operationName;
console.log(name);
```

### Variables
The `GetCallToAction` query requires an argument of type `GetCallToActionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetCallToActionVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetCallToAction` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCallToActionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetCallToActionData {
  callToAction?: {
    label: string;
    targetUrl: string;
  };
}
```
### Using `GetCallToAction`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCallToAction, GetCallToActionVariables } from '@dataconnect/generated';

// The `GetCallToAction` query requires an argument of type `GetCallToActionVariables`:
const getCallToActionVars: GetCallToActionVariables = {
  id: ..., 
};

// Call the `getCallToAction()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCallToAction(getCallToActionVars);
// Variables can be defined inline as well.
const { data } = await getCallToAction({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCallToAction(dataConnect, getCallToActionVars);

console.log(data.callToAction);

// Or, you can use the `Promise` API.
getCallToAction(getCallToActionVars).then((response) => {
  const data = response.data;
  console.log(data.callToAction);
});
```

### Using `GetCallToAction`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCallToActionRef, GetCallToActionVariables } from '@dataconnect/generated';

// The `GetCallToAction` query requires an argument of type `GetCallToActionVariables`:
const getCallToActionVars: GetCallToActionVariables = {
  id: ..., 
};

// Call the `getCallToActionRef()` function to get a reference to the query.
const ref = getCallToActionRef(getCallToActionVars);
// Variables can be defined inline as well.
const ref = getCallToActionRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCallToActionRef(dataConnect, getCallToActionVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.callToAction);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.callToAction);
});
```

## ListCallToActions
You can execute the `ListCallToActions` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listCallToActions(options?: ExecuteQueryOptions): QueryPromise<ListCallToActionsData, undefined>;

interface ListCallToActionsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCallToActionsData, undefined>;
}
export const listCallToActionsRef: ListCallToActionsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listCallToActions(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListCallToActionsData, undefined>;

interface ListCallToActionsRef {
  ...
  (dc: DataConnect): QueryRef<ListCallToActionsData, undefined>;
}
export const listCallToActionsRef: ListCallToActionsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listCallToActionsRef:
```typescript
const name = listCallToActionsRef.operationName;
console.log(name);
```

### Variables
The `ListCallToActions` query has no variables.
### Return Type
Recall that executing the `ListCallToActions` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListCallToActionsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListCallToActionsData {
  callToActions: ({
    label: string;
    targetUrl: string;
  })[];
}
```
### Using `ListCallToActions`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listCallToActions } from '@dataconnect/generated';


// Call the `listCallToActions()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listCallToActions();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listCallToActions(dataConnect);

console.log(data.callToActions);

// Or, you can use the `Promise` API.
listCallToActions().then((response) => {
  const data = response.data;
  console.log(data.callToActions);
});
```

### Using `ListCallToActions`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listCallToActionsRef } from '@dataconnect/generated';


// Call the `listCallToActionsRef()` function to get a reference to the query.
const ref = listCallToActionsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listCallToActionsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.callToActions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.callToActions);
});
```

## GetAnalyticsEvent
You can execute the `GetAnalyticsEvent` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getAnalyticsEvent(vars: GetAnalyticsEventVariables, options?: ExecuteQueryOptions): QueryPromise<GetAnalyticsEventData, GetAnalyticsEventVariables>;

interface GetAnalyticsEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAnalyticsEventVariables): QueryRef<GetAnalyticsEventData, GetAnalyticsEventVariables>;
}
export const getAnalyticsEventRef: GetAnalyticsEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getAnalyticsEvent(dc: DataConnect, vars: GetAnalyticsEventVariables, options?: ExecuteQueryOptions): QueryPromise<GetAnalyticsEventData, GetAnalyticsEventVariables>;

interface GetAnalyticsEventRef {
  ...
  (dc: DataConnect, vars: GetAnalyticsEventVariables): QueryRef<GetAnalyticsEventData, GetAnalyticsEventVariables>;
}
export const getAnalyticsEventRef: GetAnalyticsEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getAnalyticsEventRef:
```typescript
const name = getAnalyticsEventRef.operationName;
console.log(name);
```

### Variables
The `GetAnalyticsEvent` query requires an argument of type `GetAnalyticsEventVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetAnalyticsEventVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetAnalyticsEvent` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetAnalyticsEventData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetAnalyticsEventData {
  analyticsEvent?: {
    eventType: string;
    timestamp: TimestampString;
  };
}
```
### Using `GetAnalyticsEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getAnalyticsEvent, GetAnalyticsEventVariables } from '@dataconnect/generated';

// The `GetAnalyticsEvent` query requires an argument of type `GetAnalyticsEventVariables`:
const getAnalyticsEventVars: GetAnalyticsEventVariables = {
  id: ..., 
};

// Call the `getAnalyticsEvent()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getAnalyticsEvent(getAnalyticsEventVars);
// Variables can be defined inline as well.
const { data } = await getAnalyticsEvent({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getAnalyticsEvent(dataConnect, getAnalyticsEventVars);

console.log(data.analyticsEvent);

// Or, you can use the `Promise` API.
getAnalyticsEvent(getAnalyticsEventVars).then((response) => {
  const data = response.data;
  console.log(data.analyticsEvent);
});
```

### Using `GetAnalyticsEvent`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getAnalyticsEventRef, GetAnalyticsEventVariables } from '@dataconnect/generated';

// The `GetAnalyticsEvent` query requires an argument of type `GetAnalyticsEventVariables`:
const getAnalyticsEventVars: GetAnalyticsEventVariables = {
  id: ..., 
};

// Call the `getAnalyticsEventRef()` function to get a reference to the query.
const ref = getAnalyticsEventRef(getAnalyticsEventVars);
// Variables can be defined inline as well.
const ref = getAnalyticsEventRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getAnalyticsEventRef(dataConnect, getAnalyticsEventVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.analyticsEvent);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.analyticsEvent);
});
```

## ListAnalyticsEvents
You can execute the `ListAnalyticsEvents` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAnalyticsEvents(options?: ExecuteQueryOptions): QueryPromise<ListAnalyticsEventsData, undefined>;

interface ListAnalyticsEventsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAnalyticsEventsData, undefined>;
}
export const listAnalyticsEventsRef: ListAnalyticsEventsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAnalyticsEvents(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAnalyticsEventsData, undefined>;

interface ListAnalyticsEventsRef {
  ...
  (dc: DataConnect): QueryRef<ListAnalyticsEventsData, undefined>;
}
export const listAnalyticsEventsRef: ListAnalyticsEventsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAnalyticsEventsRef:
```typescript
const name = listAnalyticsEventsRef.operationName;
console.log(name);
```

### Variables
The `ListAnalyticsEvents` query has no variables.
### Return Type
Recall that executing the `ListAnalyticsEvents` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAnalyticsEventsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAnalyticsEventsData {
  analyticsEvents: ({
    eventType: string;
    timestamp: TimestampString;
  })[];
}
```
### Using `ListAnalyticsEvents`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAnalyticsEvents } from '@dataconnect/generated';


// Call the `listAnalyticsEvents()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAnalyticsEvents();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAnalyticsEvents(dataConnect);

console.log(data.analyticsEvents);

// Or, you can use the `Promise` API.
listAnalyticsEvents().then((response) => {
  const data = response.data;
  console.log(data.analyticsEvents);
});
```

### Using `ListAnalyticsEvents`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAnalyticsEventsRef } from '@dataconnect/generated';


// Call the `listAnalyticsEventsRef()` function to get a reference to the query.
const ref = listAnalyticsEventsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAnalyticsEventsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.analyticsEvents);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.analyticsEvents);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateCampaign
You can execute the `CreateCampaign` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createCampaign(): MutationPromise<CreateCampaignData, undefined>;

interface CreateCampaignRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateCampaignData, undefined>;
}
export const createCampaignRef: CreateCampaignRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createCampaign(dc: DataConnect): MutationPromise<CreateCampaignData, undefined>;

interface CreateCampaignRef {
  ...
  (dc: DataConnect): MutationRef<CreateCampaignData, undefined>;
}
export const createCampaignRef: CreateCampaignRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createCampaignRef:
```typescript
const name = createCampaignRef.operationName;
console.log(name);
```

### Variables
The `CreateCampaign` mutation has no variables.
### Return Type
Recall that executing the `CreateCampaign` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateCampaignData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateCampaignData {
  campaign_insert: Campaign_Key;
}
```
### Using `CreateCampaign`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCampaign } from '@dataconnect/generated';


// Call the `createCampaign()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createCampaign();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createCampaign(dataConnect);

console.log(data.campaign_insert);

// Or, you can use the `Promise` API.
createCampaign().then((response) => {
  const data = response.data;
  console.log(data.campaign_insert);
});
```

### Using `CreateCampaign`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createCampaignRef } from '@dataconnect/generated';


// Call the `createCampaignRef()` function to get a reference to the mutation.
const ref = createCampaignRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createCampaignRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.campaign_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.campaign_insert);
});
```

## UpdateCampaign
You can execute the `UpdateCampaign` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateCampaign(vars: UpdateCampaignVariables): MutationPromise<UpdateCampaignData, UpdateCampaignVariables>;

interface UpdateCampaignRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCampaignVariables): MutationRef<UpdateCampaignData, UpdateCampaignVariables>;
}
export const updateCampaignRef: UpdateCampaignRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateCampaign(dc: DataConnect, vars: UpdateCampaignVariables): MutationPromise<UpdateCampaignData, UpdateCampaignVariables>;

interface UpdateCampaignRef {
  ...
  (dc: DataConnect, vars: UpdateCampaignVariables): MutationRef<UpdateCampaignData, UpdateCampaignVariables>;
}
export const updateCampaignRef: UpdateCampaignRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateCampaignRef:
```typescript
const name = updateCampaignRef.operationName;
console.log(name);
```

### Variables
The `UpdateCampaign` mutation requires an argument of type `UpdateCampaignVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateCampaignVariables {
  id: UUIDString;
  budget?: number | null;
}
```
### Return Type
Recall that executing the `UpdateCampaign` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateCampaignData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateCampaignData {
  campaign_update?: Campaign_Key | null;
}
```
### Using `UpdateCampaign`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateCampaign, UpdateCampaignVariables } from '@dataconnect/generated';

// The `UpdateCampaign` mutation requires an argument of type `UpdateCampaignVariables`:
const updateCampaignVars: UpdateCampaignVariables = {
  id: ..., 
  budget: ..., // optional
};

// Call the `updateCampaign()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateCampaign(updateCampaignVars);
// Variables can be defined inline as well.
const { data } = await updateCampaign({ id: ..., budget: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateCampaign(dataConnect, updateCampaignVars);

console.log(data.campaign_update);

// Or, you can use the `Promise` API.
updateCampaign(updateCampaignVars).then((response) => {
  const data = response.data;
  console.log(data.campaign_update);
});
```

### Using `UpdateCampaign`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateCampaignRef, UpdateCampaignVariables } from '@dataconnect/generated';

// The `UpdateCampaign` mutation requires an argument of type `UpdateCampaignVariables`:
const updateCampaignVars: UpdateCampaignVariables = {
  id: ..., 
  budget: ..., // optional
};

// Call the `updateCampaignRef()` function to get a reference to the mutation.
const ref = updateCampaignRef(updateCampaignVars);
// Variables can be defined inline as well.
const ref = updateCampaignRef({ id: ..., budget: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateCampaignRef(dataConnect, updateCampaignVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.campaign_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.campaign_update);
});
```

## DeleteCampaign
You can execute the `DeleteCampaign` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteCampaign(vars: DeleteCampaignVariables): MutationPromise<DeleteCampaignData, DeleteCampaignVariables>;

interface DeleteCampaignRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteCampaignVariables): MutationRef<DeleteCampaignData, DeleteCampaignVariables>;
}
export const deleteCampaignRef: DeleteCampaignRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteCampaign(dc: DataConnect, vars: DeleteCampaignVariables): MutationPromise<DeleteCampaignData, DeleteCampaignVariables>;

interface DeleteCampaignRef {
  ...
  (dc: DataConnect, vars: DeleteCampaignVariables): MutationRef<DeleteCampaignData, DeleteCampaignVariables>;
}
export const deleteCampaignRef: DeleteCampaignRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteCampaignRef:
```typescript
const name = deleteCampaignRef.operationName;
console.log(name);
```

### Variables
The `DeleteCampaign` mutation requires an argument of type `DeleteCampaignVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteCampaignVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteCampaign` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteCampaignData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteCampaignData {
  campaign_delete?: Campaign_Key | null;
}
```
### Using `DeleteCampaign`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteCampaign, DeleteCampaignVariables } from '@dataconnect/generated';

// The `DeleteCampaign` mutation requires an argument of type `DeleteCampaignVariables`:
const deleteCampaignVars: DeleteCampaignVariables = {
  id: ..., 
};

// Call the `deleteCampaign()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteCampaign(deleteCampaignVars);
// Variables can be defined inline as well.
const { data } = await deleteCampaign({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteCampaign(dataConnect, deleteCampaignVars);

console.log(data.campaign_delete);

// Or, you can use the `Promise` API.
deleteCampaign(deleteCampaignVars).then((response) => {
  const data = response.data;
  console.log(data.campaign_delete);
});
```

### Using `DeleteCampaign`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteCampaignRef, DeleteCampaignVariables } from '@dataconnect/generated';

// The `DeleteCampaign` mutation requires an argument of type `DeleteCampaignVariables`:
const deleteCampaignVars: DeleteCampaignVariables = {
  id: ..., 
};

// Call the `deleteCampaignRef()` function to get a reference to the mutation.
const ref = deleteCampaignRef(deleteCampaignVars);
// Variables can be defined inline as well.
const ref = deleteCampaignRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteCampaignRef(dataConnect, deleteCampaignVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.campaign_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.campaign_delete);
});
```

## CreateLandingPage
You can execute the `CreateLandingPage` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createLandingPage(vars: CreateLandingPageVariables): MutationPromise<CreateLandingPageData, CreateLandingPageVariables>;

interface CreateLandingPageRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateLandingPageVariables): MutationRef<CreateLandingPageData, CreateLandingPageVariables>;
}
export const createLandingPageRef: CreateLandingPageRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createLandingPage(dc: DataConnect, vars: CreateLandingPageVariables): MutationPromise<CreateLandingPageData, CreateLandingPageVariables>;

interface CreateLandingPageRef {
  ...
  (dc: DataConnect, vars: CreateLandingPageVariables): MutationRef<CreateLandingPageData, CreateLandingPageVariables>;
}
export const createLandingPageRef: CreateLandingPageRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createLandingPageRef:
```typescript
const name = createLandingPageRef.operationName;
console.log(name);
```

### Variables
The `CreateLandingPage` mutation requires an argument of type `CreateLandingPageVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateLandingPageVariables {
  title: string;
  slug: string;
  campaignId?: UUIDString | null;
}
```
### Return Type
Recall that executing the `CreateLandingPage` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateLandingPageData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateLandingPageData {
  landingPage_insert: LandingPage_Key;
}
```
### Using `CreateLandingPage`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createLandingPage, CreateLandingPageVariables } from '@dataconnect/generated';

// The `CreateLandingPage` mutation requires an argument of type `CreateLandingPageVariables`:
const createLandingPageVars: CreateLandingPageVariables = {
  title: ..., 
  slug: ..., 
  campaignId: ..., // optional
};

// Call the `createLandingPage()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createLandingPage(createLandingPageVars);
// Variables can be defined inline as well.
const { data } = await createLandingPage({ title: ..., slug: ..., campaignId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createLandingPage(dataConnect, createLandingPageVars);

console.log(data.landingPage_insert);

// Or, you can use the `Promise` API.
createLandingPage(createLandingPageVars).then((response) => {
  const data = response.data;
  console.log(data.landingPage_insert);
});
```

### Using `CreateLandingPage`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createLandingPageRef, CreateLandingPageVariables } from '@dataconnect/generated';

// The `CreateLandingPage` mutation requires an argument of type `CreateLandingPageVariables`:
const createLandingPageVars: CreateLandingPageVariables = {
  title: ..., 
  slug: ..., 
  campaignId: ..., // optional
};

// Call the `createLandingPageRef()` function to get a reference to the mutation.
const ref = createLandingPageRef(createLandingPageVars);
// Variables can be defined inline as well.
const ref = createLandingPageRef({ title: ..., slug: ..., campaignId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createLandingPageRef(dataConnect, createLandingPageVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.landingPage_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.landingPage_insert);
});
```

## UpdateLandingPage
You can execute the `UpdateLandingPage` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateLandingPage(vars: UpdateLandingPageVariables): MutationPromise<UpdateLandingPageData, UpdateLandingPageVariables>;

interface UpdateLandingPageRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateLandingPageVariables): MutationRef<UpdateLandingPageData, UpdateLandingPageVariables>;
}
export const updateLandingPageRef: UpdateLandingPageRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateLandingPage(dc: DataConnect, vars: UpdateLandingPageVariables): MutationPromise<UpdateLandingPageData, UpdateLandingPageVariables>;

interface UpdateLandingPageRef {
  ...
  (dc: DataConnect, vars: UpdateLandingPageVariables): MutationRef<UpdateLandingPageData, UpdateLandingPageVariables>;
}
export const updateLandingPageRef: UpdateLandingPageRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateLandingPageRef:
```typescript
const name = updateLandingPageRef.operationName;
console.log(name);
```

### Variables
The `UpdateLandingPage` mutation requires an argument of type `UpdateLandingPageVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateLandingPageVariables {
  id: UUIDString;
  status?: string | null;
}
```
### Return Type
Recall that executing the `UpdateLandingPage` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateLandingPageData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateLandingPageData {
  landingPage_update?: LandingPage_Key | null;
}
```
### Using `UpdateLandingPage`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateLandingPage, UpdateLandingPageVariables } from '@dataconnect/generated';

// The `UpdateLandingPage` mutation requires an argument of type `UpdateLandingPageVariables`:
const updateLandingPageVars: UpdateLandingPageVariables = {
  id: ..., 
  status: ..., // optional
};

// Call the `updateLandingPage()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateLandingPage(updateLandingPageVars);
// Variables can be defined inline as well.
const { data } = await updateLandingPage({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateLandingPage(dataConnect, updateLandingPageVars);

console.log(data.landingPage_update);

// Or, you can use the `Promise` API.
updateLandingPage(updateLandingPageVars).then((response) => {
  const data = response.data;
  console.log(data.landingPage_update);
});
```

### Using `UpdateLandingPage`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateLandingPageRef, UpdateLandingPageVariables } from '@dataconnect/generated';

// The `UpdateLandingPage` mutation requires an argument of type `UpdateLandingPageVariables`:
const updateLandingPageVars: UpdateLandingPageVariables = {
  id: ..., 
  status: ..., // optional
};

// Call the `updateLandingPageRef()` function to get a reference to the mutation.
const ref = updateLandingPageRef(updateLandingPageVars);
// Variables can be defined inline as well.
const ref = updateLandingPageRef({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateLandingPageRef(dataConnect, updateLandingPageVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.landingPage_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.landingPage_update);
});
```

## DeleteLandingPage
You can execute the `DeleteLandingPage` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteLandingPage(vars: DeleteLandingPageVariables): MutationPromise<DeleteLandingPageData, DeleteLandingPageVariables>;

interface DeleteLandingPageRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteLandingPageVariables): MutationRef<DeleteLandingPageData, DeleteLandingPageVariables>;
}
export const deleteLandingPageRef: DeleteLandingPageRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteLandingPage(dc: DataConnect, vars: DeleteLandingPageVariables): MutationPromise<DeleteLandingPageData, DeleteLandingPageVariables>;

interface DeleteLandingPageRef {
  ...
  (dc: DataConnect, vars: DeleteLandingPageVariables): MutationRef<DeleteLandingPageData, DeleteLandingPageVariables>;
}
export const deleteLandingPageRef: DeleteLandingPageRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteLandingPageRef:
```typescript
const name = deleteLandingPageRef.operationName;
console.log(name);
```

### Variables
The `DeleteLandingPage` mutation requires an argument of type `DeleteLandingPageVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteLandingPageVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteLandingPage` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteLandingPageData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteLandingPageData {
  landingPage_delete?: LandingPage_Key | null;
}
```
### Using `DeleteLandingPage`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteLandingPage, DeleteLandingPageVariables } from '@dataconnect/generated';

// The `DeleteLandingPage` mutation requires an argument of type `DeleteLandingPageVariables`:
const deleteLandingPageVars: DeleteLandingPageVariables = {
  id: ..., 
};

// Call the `deleteLandingPage()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteLandingPage(deleteLandingPageVars);
// Variables can be defined inline as well.
const { data } = await deleteLandingPage({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteLandingPage(dataConnect, deleteLandingPageVars);

console.log(data.landingPage_delete);

// Or, you can use the `Promise` API.
deleteLandingPage(deleteLandingPageVars).then((response) => {
  const data = response.data;
  console.log(data.landingPage_delete);
});
```

### Using `DeleteLandingPage`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteLandingPageRef, DeleteLandingPageVariables } from '@dataconnect/generated';

// The `DeleteLandingPage` mutation requires an argument of type `DeleteLandingPageVariables`:
const deleteLandingPageVars: DeleteLandingPageVariables = {
  id: ..., 
};

// Call the `deleteLandingPageRef()` function to get a reference to the mutation.
const ref = deleteLandingPageRef(deleteLandingPageVars);
// Variables can be defined inline as well.
const ref = deleteLandingPageRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteLandingPageRef(dataConnect, deleteLandingPageVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.landingPage_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.landingPage_delete);
});
```

## CreateLead
You can execute the `CreateLead` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createLead(vars: CreateLeadVariables): MutationPromise<CreateLeadData, CreateLeadVariables>;

interface CreateLeadRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateLeadVariables): MutationRef<CreateLeadData, CreateLeadVariables>;
}
export const createLeadRef: CreateLeadRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createLead(dc: DataConnect, vars: CreateLeadVariables): MutationPromise<CreateLeadData, CreateLeadVariables>;

interface CreateLeadRef {
  ...
  (dc: DataConnect, vars: CreateLeadVariables): MutationRef<CreateLeadData, CreateLeadVariables>;
}
export const createLeadRef: CreateLeadRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createLeadRef:
```typescript
const name = createLeadRef.operationName;
console.log(name);
```

### Variables
The `CreateLead` mutation requires an argument of type `CreateLeadVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateLeadVariables {
  email: string;
  sourcePageId: UUIDString;
}
```
### Return Type
Recall that executing the `CreateLead` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateLeadData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateLeadData {
  lead_insert: Lead_Key;
}
```
### Using `CreateLead`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createLead, CreateLeadVariables } from '@dataconnect/generated';

// The `CreateLead` mutation requires an argument of type `CreateLeadVariables`:
const createLeadVars: CreateLeadVariables = {
  email: ..., 
  sourcePageId: ..., 
};

// Call the `createLead()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createLead(createLeadVars);
// Variables can be defined inline as well.
const { data } = await createLead({ email: ..., sourcePageId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createLead(dataConnect, createLeadVars);

console.log(data.lead_insert);

// Or, you can use the `Promise` API.
createLead(createLeadVars).then((response) => {
  const data = response.data;
  console.log(data.lead_insert);
});
```

### Using `CreateLead`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createLeadRef, CreateLeadVariables } from '@dataconnect/generated';

// The `CreateLead` mutation requires an argument of type `CreateLeadVariables`:
const createLeadVars: CreateLeadVariables = {
  email: ..., 
  sourcePageId: ..., 
};

// Call the `createLeadRef()` function to get a reference to the mutation.
const ref = createLeadRef(createLeadVars);
// Variables can be defined inline as well.
const ref = createLeadRef({ email: ..., sourcePageId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createLeadRef(dataConnect, createLeadVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.lead_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.lead_insert);
});
```

## UpdateLead
You can execute the `UpdateLead` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateLead(vars: UpdateLeadVariables): MutationPromise<UpdateLeadData, UpdateLeadVariables>;

interface UpdateLeadRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateLeadVariables): MutationRef<UpdateLeadData, UpdateLeadVariables>;
}
export const updateLeadRef: UpdateLeadRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateLead(dc: DataConnect, vars: UpdateLeadVariables): MutationPromise<UpdateLeadData, UpdateLeadVariables>;

interface UpdateLeadRef {
  ...
  (dc: DataConnect, vars: UpdateLeadVariables): MutationRef<UpdateLeadData, UpdateLeadVariables>;
}
export const updateLeadRef: UpdateLeadRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateLeadRef:
```typescript
const name = updateLeadRef.operationName;
console.log(name);
```

### Variables
The `UpdateLead` mutation requires an argument of type `UpdateLeadVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateLeadVariables {
  id: UUIDString;
  company?: string | null;
}
```
### Return Type
Recall that executing the `UpdateLead` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateLeadData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateLeadData {
  lead_update?: Lead_Key | null;
}
```
### Using `UpdateLead`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateLead, UpdateLeadVariables } from '@dataconnect/generated';

// The `UpdateLead` mutation requires an argument of type `UpdateLeadVariables`:
const updateLeadVars: UpdateLeadVariables = {
  id: ..., 
  company: ..., // optional
};

// Call the `updateLead()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateLead(updateLeadVars);
// Variables can be defined inline as well.
const { data } = await updateLead({ id: ..., company: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateLead(dataConnect, updateLeadVars);

console.log(data.lead_update);

// Or, you can use the `Promise` API.
updateLead(updateLeadVars).then((response) => {
  const data = response.data;
  console.log(data.lead_update);
});
```

### Using `UpdateLead`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateLeadRef, UpdateLeadVariables } from '@dataconnect/generated';

// The `UpdateLead` mutation requires an argument of type `UpdateLeadVariables`:
const updateLeadVars: UpdateLeadVariables = {
  id: ..., 
  company: ..., // optional
};

// Call the `updateLeadRef()` function to get a reference to the mutation.
const ref = updateLeadRef(updateLeadVars);
// Variables can be defined inline as well.
const ref = updateLeadRef({ id: ..., company: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateLeadRef(dataConnect, updateLeadVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.lead_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.lead_update);
});
```

## DeleteLead
You can execute the `DeleteLead` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteLead(vars: DeleteLeadVariables): MutationPromise<DeleteLeadData, DeleteLeadVariables>;

interface DeleteLeadRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteLeadVariables): MutationRef<DeleteLeadData, DeleteLeadVariables>;
}
export const deleteLeadRef: DeleteLeadRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteLead(dc: DataConnect, vars: DeleteLeadVariables): MutationPromise<DeleteLeadData, DeleteLeadVariables>;

interface DeleteLeadRef {
  ...
  (dc: DataConnect, vars: DeleteLeadVariables): MutationRef<DeleteLeadData, DeleteLeadVariables>;
}
export const deleteLeadRef: DeleteLeadRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteLeadRef:
```typescript
const name = deleteLeadRef.operationName;
console.log(name);
```

### Variables
The `DeleteLead` mutation requires an argument of type `DeleteLeadVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteLeadVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteLead` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteLeadData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteLeadData {
  lead_delete?: Lead_Key | null;
}
```
### Using `DeleteLead`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteLead, DeleteLeadVariables } from '@dataconnect/generated';

// The `DeleteLead` mutation requires an argument of type `DeleteLeadVariables`:
const deleteLeadVars: DeleteLeadVariables = {
  id: ..., 
};

// Call the `deleteLead()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteLead(deleteLeadVars);
// Variables can be defined inline as well.
const { data } = await deleteLead({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteLead(dataConnect, deleteLeadVars);

console.log(data.lead_delete);

// Or, you can use the `Promise` API.
deleteLead(deleteLeadVars).then((response) => {
  const data = response.data;
  console.log(data.lead_delete);
});
```

### Using `DeleteLead`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteLeadRef, DeleteLeadVariables } from '@dataconnect/generated';

// The `DeleteLead` mutation requires an argument of type `DeleteLeadVariables`:
const deleteLeadVars: DeleteLeadVariables = {
  id: ..., 
};

// Call the `deleteLeadRef()` function to get a reference to the mutation.
const ref = deleteLeadRef(deleteLeadVars);
// Variables can be defined inline as well.
const ref = deleteLeadRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteLeadRef(dataConnect, deleteLeadVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.lead_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.lead_delete);
});
```

## CreateCallToAction
You can execute the `CreateCallToAction` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createCallToAction(vars: CreateCallToActionVariables): MutationPromise<CreateCallToActionData, CreateCallToActionVariables>;

interface CreateCallToActionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCallToActionVariables): MutationRef<CreateCallToActionData, CreateCallToActionVariables>;
}
export const createCallToActionRef: CreateCallToActionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createCallToAction(dc: DataConnect, vars: CreateCallToActionVariables): MutationPromise<CreateCallToActionData, CreateCallToActionVariables>;

interface CreateCallToActionRef {
  ...
  (dc: DataConnect, vars: CreateCallToActionVariables): MutationRef<CreateCallToActionData, CreateCallToActionVariables>;
}
export const createCallToActionRef: CreateCallToActionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createCallToActionRef:
```typescript
const name = createCallToActionRef.operationName;
console.log(name);
```

### Variables
The `CreateCallToAction` mutation requires an argument of type `CreateCallToActionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateCallToActionVariables {
  label: string;
  url: string;
  lpId: UUIDString;
}
```
### Return Type
Recall that executing the `CreateCallToAction` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateCallToActionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateCallToActionData {
  callToAction_insert: CallToAction_Key;
}
```
### Using `CreateCallToAction`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCallToAction, CreateCallToActionVariables } from '@dataconnect/generated';

// The `CreateCallToAction` mutation requires an argument of type `CreateCallToActionVariables`:
const createCallToActionVars: CreateCallToActionVariables = {
  label: ..., 
  url: ..., 
  lpId: ..., 
};

// Call the `createCallToAction()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createCallToAction(createCallToActionVars);
// Variables can be defined inline as well.
const { data } = await createCallToAction({ label: ..., url: ..., lpId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createCallToAction(dataConnect, createCallToActionVars);

console.log(data.callToAction_insert);

// Or, you can use the `Promise` API.
createCallToAction(createCallToActionVars).then((response) => {
  const data = response.data;
  console.log(data.callToAction_insert);
});
```

### Using `CreateCallToAction`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createCallToActionRef, CreateCallToActionVariables } from '@dataconnect/generated';

// The `CreateCallToAction` mutation requires an argument of type `CreateCallToActionVariables`:
const createCallToActionVars: CreateCallToActionVariables = {
  label: ..., 
  url: ..., 
  lpId: ..., 
};

// Call the `createCallToActionRef()` function to get a reference to the mutation.
const ref = createCallToActionRef(createCallToActionVars);
// Variables can be defined inline as well.
const ref = createCallToActionRef({ label: ..., url: ..., lpId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createCallToActionRef(dataConnect, createCallToActionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.callToAction_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.callToAction_insert);
});
```

## UpdateCallToAction
You can execute the `UpdateCallToAction` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateCallToAction(vars: UpdateCallToActionVariables): MutationPromise<UpdateCallToActionData, UpdateCallToActionVariables>;

interface UpdateCallToActionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCallToActionVariables): MutationRef<UpdateCallToActionData, UpdateCallToActionVariables>;
}
export const updateCallToActionRef: UpdateCallToActionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateCallToAction(dc: DataConnect, vars: UpdateCallToActionVariables): MutationPromise<UpdateCallToActionData, UpdateCallToActionVariables>;

interface UpdateCallToActionRef {
  ...
  (dc: DataConnect, vars: UpdateCallToActionVariables): MutationRef<UpdateCallToActionData, UpdateCallToActionVariables>;
}
export const updateCallToActionRef: UpdateCallToActionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateCallToActionRef:
```typescript
const name = updateCallToActionRef.operationName;
console.log(name);
```

### Variables
The `UpdateCallToAction` mutation requires an argument of type `UpdateCallToActionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateCallToActionVariables {
  id: UUIDString;
  label?: string | null;
}
```
### Return Type
Recall that executing the `UpdateCallToAction` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateCallToActionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateCallToActionData {
  callToAction_update?: CallToAction_Key | null;
}
```
### Using `UpdateCallToAction`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateCallToAction, UpdateCallToActionVariables } from '@dataconnect/generated';

// The `UpdateCallToAction` mutation requires an argument of type `UpdateCallToActionVariables`:
const updateCallToActionVars: UpdateCallToActionVariables = {
  id: ..., 
  label: ..., // optional
};

// Call the `updateCallToAction()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateCallToAction(updateCallToActionVars);
// Variables can be defined inline as well.
const { data } = await updateCallToAction({ id: ..., label: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateCallToAction(dataConnect, updateCallToActionVars);

console.log(data.callToAction_update);

// Or, you can use the `Promise` API.
updateCallToAction(updateCallToActionVars).then((response) => {
  const data = response.data;
  console.log(data.callToAction_update);
});
```

### Using `UpdateCallToAction`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateCallToActionRef, UpdateCallToActionVariables } from '@dataconnect/generated';

// The `UpdateCallToAction` mutation requires an argument of type `UpdateCallToActionVariables`:
const updateCallToActionVars: UpdateCallToActionVariables = {
  id: ..., 
  label: ..., // optional
};

// Call the `updateCallToActionRef()` function to get a reference to the mutation.
const ref = updateCallToActionRef(updateCallToActionVars);
// Variables can be defined inline as well.
const ref = updateCallToActionRef({ id: ..., label: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateCallToActionRef(dataConnect, updateCallToActionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.callToAction_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.callToAction_update);
});
```

## DeleteCallToAction
You can execute the `DeleteCallToAction` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteCallToAction(vars: DeleteCallToActionVariables): MutationPromise<DeleteCallToActionData, DeleteCallToActionVariables>;

interface DeleteCallToActionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteCallToActionVariables): MutationRef<DeleteCallToActionData, DeleteCallToActionVariables>;
}
export const deleteCallToActionRef: DeleteCallToActionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteCallToAction(dc: DataConnect, vars: DeleteCallToActionVariables): MutationPromise<DeleteCallToActionData, DeleteCallToActionVariables>;

interface DeleteCallToActionRef {
  ...
  (dc: DataConnect, vars: DeleteCallToActionVariables): MutationRef<DeleteCallToActionData, DeleteCallToActionVariables>;
}
export const deleteCallToActionRef: DeleteCallToActionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteCallToActionRef:
```typescript
const name = deleteCallToActionRef.operationName;
console.log(name);
```

### Variables
The `DeleteCallToAction` mutation requires an argument of type `DeleteCallToActionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteCallToActionVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteCallToAction` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteCallToActionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteCallToActionData {
  callToAction_delete?: CallToAction_Key | null;
}
```
### Using `DeleteCallToAction`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteCallToAction, DeleteCallToActionVariables } from '@dataconnect/generated';

// The `DeleteCallToAction` mutation requires an argument of type `DeleteCallToActionVariables`:
const deleteCallToActionVars: DeleteCallToActionVariables = {
  id: ..., 
};

// Call the `deleteCallToAction()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteCallToAction(deleteCallToActionVars);
// Variables can be defined inline as well.
const { data } = await deleteCallToAction({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteCallToAction(dataConnect, deleteCallToActionVars);

console.log(data.callToAction_delete);

// Or, you can use the `Promise` API.
deleteCallToAction(deleteCallToActionVars).then((response) => {
  const data = response.data;
  console.log(data.callToAction_delete);
});
```

### Using `DeleteCallToAction`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteCallToActionRef, DeleteCallToActionVariables } from '@dataconnect/generated';

// The `DeleteCallToAction` mutation requires an argument of type `DeleteCallToActionVariables`:
const deleteCallToActionVars: DeleteCallToActionVariables = {
  id: ..., 
};

// Call the `deleteCallToActionRef()` function to get a reference to the mutation.
const ref = deleteCallToActionRef(deleteCallToActionVars);
// Variables can be defined inline as well.
const ref = deleteCallToActionRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteCallToActionRef(dataConnect, deleteCallToActionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.callToAction_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.callToAction_delete);
});
```

## CreateAnalyticsEvent
You can execute the `CreateAnalyticsEvent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createAnalyticsEvent(vars: CreateAnalyticsEventVariables): MutationPromise<CreateAnalyticsEventData, CreateAnalyticsEventVariables>;

interface CreateAnalyticsEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAnalyticsEventVariables): MutationRef<CreateAnalyticsEventData, CreateAnalyticsEventVariables>;
}
export const createAnalyticsEventRef: CreateAnalyticsEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createAnalyticsEvent(dc: DataConnect, vars: CreateAnalyticsEventVariables): MutationPromise<CreateAnalyticsEventData, CreateAnalyticsEventVariables>;

interface CreateAnalyticsEventRef {
  ...
  (dc: DataConnect, vars: CreateAnalyticsEventVariables): MutationRef<CreateAnalyticsEventData, CreateAnalyticsEventVariables>;
}
export const createAnalyticsEventRef: CreateAnalyticsEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createAnalyticsEventRef:
```typescript
const name = createAnalyticsEventRef.operationName;
console.log(name);
```

### Variables
The `CreateAnalyticsEvent` mutation requires an argument of type `CreateAnalyticsEventVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateAnalyticsEventVariables {
  type: string;
  lpId: UUIDString;
}
```
### Return Type
Recall that executing the `CreateAnalyticsEvent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateAnalyticsEventData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateAnalyticsEventData {
  analyticsEvent_insert: AnalyticsEvent_Key;
}
```
### Using `CreateAnalyticsEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createAnalyticsEvent, CreateAnalyticsEventVariables } from '@dataconnect/generated';

// The `CreateAnalyticsEvent` mutation requires an argument of type `CreateAnalyticsEventVariables`:
const createAnalyticsEventVars: CreateAnalyticsEventVariables = {
  type: ..., 
  lpId: ..., 
};

// Call the `createAnalyticsEvent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createAnalyticsEvent(createAnalyticsEventVars);
// Variables can be defined inline as well.
const { data } = await createAnalyticsEvent({ type: ..., lpId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createAnalyticsEvent(dataConnect, createAnalyticsEventVars);

console.log(data.analyticsEvent_insert);

// Or, you can use the `Promise` API.
createAnalyticsEvent(createAnalyticsEventVars).then((response) => {
  const data = response.data;
  console.log(data.analyticsEvent_insert);
});
```

### Using `CreateAnalyticsEvent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createAnalyticsEventRef, CreateAnalyticsEventVariables } from '@dataconnect/generated';

// The `CreateAnalyticsEvent` mutation requires an argument of type `CreateAnalyticsEventVariables`:
const createAnalyticsEventVars: CreateAnalyticsEventVariables = {
  type: ..., 
  lpId: ..., 
};

// Call the `createAnalyticsEventRef()` function to get a reference to the mutation.
const ref = createAnalyticsEventRef(createAnalyticsEventVars);
// Variables can be defined inline as well.
const ref = createAnalyticsEventRef({ type: ..., lpId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createAnalyticsEventRef(dataConnect, createAnalyticsEventVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.analyticsEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.analyticsEvent_insert);
});
```

## DeleteAnalyticsEvent
You can execute the `DeleteAnalyticsEvent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteAnalyticsEvent(vars: DeleteAnalyticsEventVariables): MutationPromise<DeleteAnalyticsEventData, DeleteAnalyticsEventVariables>;

interface DeleteAnalyticsEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteAnalyticsEventVariables): MutationRef<DeleteAnalyticsEventData, DeleteAnalyticsEventVariables>;
}
export const deleteAnalyticsEventRef: DeleteAnalyticsEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteAnalyticsEvent(dc: DataConnect, vars: DeleteAnalyticsEventVariables): MutationPromise<DeleteAnalyticsEventData, DeleteAnalyticsEventVariables>;

interface DeleteAnalyticsEventRef {
  ...
  (dc: DataConnect, vars: DeleteAnalyticsEventVariables): MutationRef<DeleteAnalyticsEventData, DeleteAnalyticsEventVariables>;
}
export const deleteAnalyticsEventRef: DeleteAnalyticsEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteAnalyticsEventRef:
```typescript
const name = deleteAnalyticsEventRef.operationName;
console.log(name);
```

### Variables
The `DeleteAnalyticsEvent` mutation requires an argument of type `DeleteAnalyticsEventVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteAnalyticsEventVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteAnalyticsEvent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteAnalyticsEventData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteAnalyticsEventData {
  analyticsEvent_delete?: AnalyticsEvent_Key | null;
}
```
### Using `DeleteAnalyticsEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteAnalyticsEvent, DeleteAnalyticsEventVariables } from '@dataconnect/generated';

// The `DeleteAnalyticsEvent` mutation requires an argument of type `DeleteAnalyticsEventVariables`:
const deleteAnalyticsEventVars: DeleteAnalyticsEventVariables = {
  id: ..., 
};

// Call the `deleteAnalyticsEvent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteAnalyticsEvent(deleteAnalyticsEventVars);
// Variables can be defined inline as well.
const { data } = await deleteAnalyticsEvent({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteAnalyticsEvent(dataConnect, deleteAnalyticsEventVars);

console.log(data.analyticsEvent_delete);

// Or, you can use the `Promise` API.
deleteAnalyticsEvent(deleteAnalyticsEventVars).then((response) => {
  const data = response.data;
  console.log(data.analyticsEvent_delete);
});
```

### Using `DeleteAnalyticsEvent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteAnalyticsEventRef, DeleteAnalyticsEventVariables } from '@dataconnect/generated';

// The `DeleteAnalyticsEvent` mutation requires an argument of type `DeleteAnalyticsEventVariables`:
const deleteAnalyticsEventVars: DeleteAnalyticsEventVariables = {
  id: ..., 
};

// Call the `deleteAnalyticsEventRef()` function to get a reference to the mutation.
const ref = deleteAnalyticsEventRef(deleteAnalyticsEventVars);
// Variables can be defined inline as well.
const ref = deleteAnalyticsEventRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteAnalyticsEventRef(dataConnect, deleteAnalyticsEventVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.analyticsEvent_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.analyticsEvent_delete);
});
```

