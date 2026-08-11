# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreateCampaign, useUpdateCampaign, useDeleteCampaign, useGetCampaign, useListCampaigns, useCreateLandingPage, useUpdateLandingPage, useDeleteLandingPage, useGetLandingPage, useListLandingPages } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreateCampaign();

const { data, isPending, isSuccess, isError, error } = useUpdateCampaign(updateCampaignVars);

const { data, isPending, isSuccess, isError, error } = useDeleteCampaign(deleteCampaignVars);

const { data, isPending, isSuccess, isError, error } = useGetCampaign(getCampaignVars);

const { data, isPending, isSuccess, isError, error } = useListCampaigns();

const { data, isPending, isSuccess, isError, error } = useCreateLandingPage(createLandingPageVars);

const { data, isPending, isSuccess, isError, error } = useUpdateLandingPage(updateLandingPageVars);

const { data, isPending, isSuccess, isError, error } = useDeleteLandingPage(deleteLandingPageVars);

const { data, isPending, isSuccess, isError, error } = useGetLandingPage(getLandingPageVars);

const { data, isPending, isSuccess, isError, error } = useListLandingPages();

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createCampaign, updateCampaign, deleteCampaign, getCampaign, listCampaigns, createLandingPage, updateLandingPage, deleteLandingPage, getLandingPage, listLandingPages } from '@dataconnect/generated';


// Operation CreateCampaign: 
const { data } = await CreateCampaign(dataConnect);

// Operation UpdateCampaign:  For variables, look at type UpdateCampaignVars in ../index.d.ts
const { data } = await UpdateCampaign(dataConnect, updateCampaignVars);

// Operation DeleteCampaign:  For variables, look at type DeleteCampaignVars in ../index.d.ts
const { data } = await DeleteCampaign(dataConnect, deleteCampaignVars);

// Operation GetCampaign:  For variables, look at type GetCampaignVars in ../index.d.ts
const { data } = await GetCampaign(dataConnect, getCampaignVars);

// Operation ListCampaigns: 
const { data } = await ListCampaigns(dataConnect);

// Operation CreateLandingPage:  For variables, look at type CreateLandingPageVars in ../index.d.ts
const { data } = await CreateLandingPage(dataConnect, createLandingPageVars);

// Operation UpdateLandingPage:  For variables, look at type UpdateLandingPageVars in ../index.d.ts
const { data } = await UpdateLandingPage(dataConnect, updateLandingPageVars);

// Operation DeleteLandingPage:  For variables, look at type DeleteLandingPageVars in ../index.d.ts
const { data } = await DeleteLandingPage(dataConnect, deleteLandingPageVars);

// Operation GetLandingPage:  For variables, look at type GetLandingPageVars in ../index.d.ts
const { data } = await GetLandingPage(dataConnect, getLandingPageVars);

// Operation ListLandingPages: 
const { data } = await ListLandingPages(dataConnect);


```