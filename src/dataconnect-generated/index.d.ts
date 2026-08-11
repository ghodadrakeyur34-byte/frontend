import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AnalyticsEvent_Key {
  id: UUIDString;
  __typename?: 'AnalyticsEvent_Key';
}

export interface CallToAction_Key {
  id: UUIDString;
  __typename?: 'CallToAction_Key';
}

export interface Campaign_Key {
  id: UUIDString;
  __typename?: 'Campaign_Key';
}

export interface CreateAnalyticsEventData {
  analyticsEvent_insert: AnalyticsEvent_Key;
}

export interface CreateAnalyticsEventVariables {
  type: string;
  lpId: UUIDString;
}

export interface CreateCallToActionData {
  callToAction_insert: CallToAction_Key;
}

export interface CreateCallToActionVariables {
  label: string;
  url: string;
  lpId: UUIDString;
}

export interface CreateCampaignData {
  campaign_insert: Campaign_Key;
}

export interface CreateLandingPageData {
  landingPage_insert: LandingPage_Key;
}

export interface CreateLandingPageVariables {
  title: string;
  slug: string;
  campaignId?: UUIDString | null;
}

export interface CreateLeadData {
  lead_insert: Lead_Key;
}

export interface CreateLeadVariables {
  email: string;
  sourcePageId: UUIDString;
}

export interface DeleteAnalyticsEventData {
  analyticsEvent_delete?: AnalyticsEvent_Key | null;
}

export interface DeleteAnalyticsEventVariables {
  id: UUIDString;
}

export interface DeleteCallToActionData {
  callToAction_delete?: CallToAction_Key | null;
}

export interface DeleteCallToActionVariables {
  id: UUIDString;
}

export interface DeleteCampaignData {
  campaign_delete?: Campaign_Key | null;
}

export interface DeleteCampaignVariables {
  id: UUIDString;
}

export interface DeleteLandingPageData {
  landingPage_delete?: LandingPage_Key | null;
}

export interface DeleteLandingPageVariables {
  id: UUIDString;
}

export interface DeleteLeadData {
  lead_delete?: Lead_Key | null;
}

export interface DeleteLeadVariables {
  id: UUIDString;
}

export interface GetAnalyticsEventData {
  analyticsEvent?: {
    eventType: string;
    timestamp: TimestampString;
  };
}

export interface GetAnalyticsEventVariables {
  id: UUIDString;
}

export interface GetCallToActionData {
  callToAction?: {
    label: string;
    targetUrl: string;
  };
}

export interface GetCallToActionVariables {
  id: UUIDString;
}

export interface GetCampaignData {
  campaign?: {
    name: string;
    startDate: DateString;
    budget?: number | null;
  };
}

export interface GetCampaignVariables {
  id: UUIDString;
}

export interface GetLandingPageData {
  landingPage?: {
    title: string;
    slug: string;
    status: string;
  };
}

export interface GetLandingPageVariables {
  id: UUIDString;
}

export interface GetLeadData {
  lead?: {
    email: string;
    firstName?: string | null;
    company?: string | null;
  };
}

export interface GetLeadVariables {
  id: UUIDString;
}

export interface LandingPage_Key {
  id: UUIDString;
  __typename?: 'LandingPage_Key';
}

export interface Lead_Key {
  id: UUIDString;
  __typename?: 'Lead_Key';
}

export interface ListAnalyticsEventsData {
  analyticsEvents: ({
    eventType: string;
    timestamp: TimestampString;
  })[];
}

export interface ListCallToActionsData {
  callToActions: ({
    label: string;
    targetUrl: string;
  })[];
}

export interface ListCampaignsData {
  campaigns: ({
    name: string;
    budget?: number | null;
  })[];
}

export interface ListLandingPagesData {
  landingPages: ({
    title: string;
    slug: string;
    status: string;
  })[];
}

export interface ListLeadsData {
  leads: ({
    email: string;
    firstName?: string | null;
    submittedAt: TimestampString;
  })[];
}

export interface UpdateCallToActionData {
  callToAction_update?: CallToAction_Key | null;
}

export interface UpdateCallToActionVariables {
  id: UUIDString;
  label?: string | null;
}

export interface UpdateCampaignData {
  campaign_update?: Campaign_Key | null;
}

export interface UpdateCampaignVariables {
  id: UUIDString;
  budget?: number | null;
}

export interface UpdateLandingPageData {
  landingPage_update?: LandingPage_Key | null;
}

export interface UpdateLandingPageVariables {
  id: UUIDString;
  status?: string | null;
}

export interface UpdateLeadData {
  lead_update?: Lead_Key | null;
}

export interface UpdateLeadVariables {
  id: UUIDString;
  company?: string | null;
}

interface CreateCampaignRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateCampaignData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateCampaignData, undefined>;
  operationName: string;
}
export const createCampaignRef: CreateCampaignRef;

export function createCampaign(): MutationPromise<CreateCampaignData, undefined>;
export function createCampaign(dc: DataConnect): MutationPromise<CreateCampaignData, undefined>;

interface UpdateCampaignRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCampaignVariables): MutationRef<UpdateCampaignData, UpdateCampaignVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateCampaignVariables): MutationRef<UpdateCampaignData, UpdateCampaignVariables>;
  operationName: string;
}
export const updateCampaignRef: UpdateCampaignRef;

export function updateCampaign(vars: UpdateCampaignVariables): MutationPromise<UpdateCampaignData, UpdateCampaignVariables>;
export function updateCampaign(dc: DataConnect, vars: UpdateCampaignVariables): MutationPromise<UpdateCampaignData, UpdateCampaignVariables>;

interface DeleteCampaignRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteCampaignVariables): MutationRef<DeleteCampaignData, DeleteCampaignVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteCampaignVariables): MutationRef<DeleteCampaignData, DeleteCampaignVariables>;
  operationName: string;
}
export const deleteCampaignRef: DeleteCampaignRef;

export function deleteCampaign(vars: DeleteCampaignVariables): MutationPromise<DeleteCampaignData, DeleteCampaignVariables>;
export function deleteCampaign(dc: DataConnect, vars: DeleteCampaignVariables): MutationPromise<DeleteCampaignData, DeleteCampaignVariables>;

interface GetCampaignRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCampaignVariables): QueryRef<GetCampaignData, GetCampaignVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCampaignVariables): QueryRef<GetCampaignData, GetCampaignVariables>;
  operationName: string;
}
export const getCampaignRef: GetCampaignRef;

export function getCampaign(vars: GetCampaignVariables, options?: ExecuteQueryOptions): QueryPromise<GetCampaignData, GetCampaignVariables>;
export function getCampaign(dc: DataConnect, vars: GetCampaignVariables, options?: ExecuteQueryOptions): QueryPromise<GetCampaignData, GetCampaignVariables>;

interface ListCampaignsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCampaignsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListCampaignsData, undefined>;
  operationName: string;
}
export const listCampaignsRef: ListCampaignsRef;

export function listCampaigns(options?: ExecuteQueryOptions): QueryPromise<ListCampaignsData, undefined>;
export function listCampaigns(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListCampaignsData, undefined>;

interface CreateLandingPageRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateLandingPageVariables): MutationRef<CreateLandingPageData, CreateLandingPageVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateLandingPageVariables): MutationRef<CreateLandingPageData, CreateLandingPageVariables>;
  operationName: string;
}
export const createLandingPageRef: CreateLandingPageRef;

export function createLandingPage(vars: CreateLandingPageVariables): MutationPromise<CreateLandingPageData, CreateLandingPageVariables>;
export function createLandingPage(dc: DataConnect, vars: CreateLandingPageVariables): MutationPromise<CreateLandingPageData, CreateLandingPageVariables>;

interface UpdateLandingPageRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateLandingPageVariables): MutationRef<UpdateLandingPageData, UpdateLandingPageVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateLandingPageVariables): MutationRef<UpdateLandingPageData, UpdateLandingPageVariables>;
  operationName: string;
}
export const updateLandingPageRef: UpdateLandingPageRef;

export function updateLandingPage(vars: UpdateLandingPageVariables): MutationPromise<UpdateLandingPageData, UpdateLandingPageVariables>;
export function updateLandingPage(dc: DataConnect, vars: UpdateLandingPageVariables): MutationPromise<UpdateLandingPageData, UpdateLandingPageVariables>;

interface DeleteLandingPageRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteLandingPageVariables): MutationRef<DeleteLandingPageData, DeleteLandingPageVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteLandingPageVariables): MutationRef<DeleteLandingPageData, DeleteLandingPageVariables>;
  operationName: string;
}
export const deleteLandingPageRef: DeleteLandingPageRef;

export function deleteLandingPage(vars: DeleteLandingPageVariables): MutationPromise<DeleteLandingPageData, DeleteLandingPageVariables>;
export function deleteLandingPage(dc: DataConnect, vars: DeleteLandingPageVariables): MutationPromise<DeleteLandingPageData, DeleteLandingPageVariables>;

interface GetLandingPageRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLandingPageVariables): QueryRef<GetLandingPageData, GetLandingPageVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetLandingPageVariables): QueryRef<GetLandingPageData, GetLandingPageVariables>;
  operationName: string;
}
export const getLandingPageRef: GetLandingPageRef;

export function getLandingPage(vars: GetLandingPageVariables, options?: ExecuteQueryOptions): QueryPromise<GetLandingPageData, GetLandingPageVariables>;
export function getLandingPage(dc: DataConnect, vars: GetLandingPageVariables, options?: ExecuteQueryOptions): QueryPromise<GetLandingPageData, GetLandingPageVariables>;

interface ListLandingPagesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListLandingPagesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListLandingPagesData, undefined>;
  operationName: string;
}
export const listLandingPagesRef: ListLandingPagesRef;

export function listLandingPages(options?: ExecuteQueryOptions): QueryPromise<ListLandingPagesData, undefined>;
export function listLandingPages(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListLandingPagesData, undefined>;

interface CreateLeadRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateLeadVariables): MutationRef<CreateLeadData, CreateLeadVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateLeadVariables): MutationRef<CreateLeadData, CreateLeadVariables>;
  operationName: string;
}
export const createLeadRef: CreateLeadRef;

export function createLead(vars: CreateLeadVariables): MutationPromise<CreateLeadData, CreateLeadVariables>;
export function createLead(dc: DataConnect, vars: CreateLeadVariables): MutationPromise<CreateLeadData, CreateLeadVariables>;

interface UpdateLeadRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateLeadVariables): MutationRef<UpdateLeadData, UpdateLeadVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateLeadVariables): MutationRef<UpdateLeadData, UpdateLeadVariables>;
  operationName: string;
}
export const updateLeadRef: UpdateLeadRef;

export function updateLead(vars: UpdateLeadVariables): MutationPromise<UpdateLeadData, UpdateLeadVariables>;
export function updateLead(dc: DataConnect, vars: UpdateLeadVariables): MutationPromise<UpdateLeadData, UpdateLeadVariables>;

interface DeleteLeadRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteLeadVariables): MutationRef<DeleteLeadData, DeleteLeadVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteLeadVariables): MutationRef<DeleteLeadData, DeleteLeadVariables>;
  operationName: string;
}
export const deleteLeadRef: DeleteLeadRef;

export function deleteLead(vars: DeleteLeadVariables): MutationPromise<DeleteLeadData, DeleteLeadVariables>;
export function deleteLead(dc: DataConnect, vars: DeleteLeadVariables): MutationPromise<DeleteLeadData, DeleteLeadVariables>;

interface GetLeadRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLeadVariables): QueryRef<GetLeadData, GetLeadVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetLeadVariables): QueryRef<GetLeadData, GetLeadVariables>;
  operationName: string;
}
export const getLeadRef: GetLeadRef;

export function getLead(vars: GetLeadVariables, options?: ExecuteQueryOptions): QueryPromise<GetLeadData, GetLeadVariables>;
export function getLead(dc: DataConnect, vars: GetLeadVariables, options?: ExecuteQueryOptions): QueryPromise<GetLeadData, GetLeadVariables>;

interface ListLeadsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListLeadsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListLeadsData, undefined>;
  operationName: string;
}
export const listLeadsRef: ListLeadsRef;

export function listLeads(options?: ExecuteQueryOptions): QueryPromise<ListLeadsData, undefined>;
export function listLeads(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListLeadsData, undefined>;

interface CreateCallToActionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCallToActionVariables): MutationRef<CreateCallToActionData, CreateCallToActionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateCallToActionVariables): MutationRef<CreateCallToActionData, CreateCallToActionVariables>;
  operationName: string;
}
export const createCallToActionRef: CreateCallToActionRef;

export function createCallToAction(vars: CreateCallToActionVariables): MutationPromise<CreateCallToActionData, CreateCallToActionVariables>;
export function createCallToAction(dc: DataConnect, vars: CreateCallToActionVariables): MutationPromise<CreateCallToActionData, CreateCallToActionVariables>;

interface UpdateCallToActionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCallToActionVariables): MutationRef<UpdateCallToActionData, UpdateCallToActionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateCallToActionVariables): MutationRef<UpdateCallToActionData, UpdateCallToActionVariables>;
  operationName: string;
}
export const updateCallToActionRef: UpdateCallToActionRef;

export function updateCallToAction(vars: UpdateCallToActionVariables): MutationPromise<UpdateCallToActionData, UpdateCallToActionVariables>;
export function updateCallToAction(dc: DataConnect, vars: UpdateCallToActionVariables): MutationPromise<UpdateCallToActionData, UpdateCallToActionVariables>;

interface DeleteCallToActionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteCallToActionVariables): MutationRef<DeleteCallToActionData, DeleteCallToActionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteCallToActionVariables): MutationRef<DeleteCallToActionData, DeleteCallToActionVariables>;
  operationName: string;
}
export const deleteCallToActionRef: DeleteCallToActionRef;

export function deleteCallToAction(vars: DeleteCallToActionVariables): MutationPromise<DeleteCallToActionData, DeleteCallToActionVariables>;
export function deleteCallToAction(dc: DataConnect, vars: DeleteCallToActionVariables): MutationPromise<DeleteCallToActionData, DeleteCallToActionVariables>;

interface GetCallToActionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCallToActionVariables): QueryRef<GetCallToActionData, GetCallToActionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCallToActionVariables): QueryRef<GetCallToActionData, GetCallToActionVariables>;
  operationName: string;
}
export const getCallToActionRef: GetCallToActionRef;

export function getCallToAction(vars: GetCallToActionVariables, options?: ExecuteQueryOptions): QueryPromise<GetCallToActionData, GetCallToActionVariables>;
export function getCallToAction(dc: DataConnect, vars: GetCallToActionVariables, options?: ExecuteQueryOptions): QueryPromise<GetCallToActionData, GetCallToActionVariables>;

interface ListCallToActionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCallToActionsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListCallToActionsData, undefined>;
  operationName: string;
}
export const listCallToActionsRef: ListCallToActionsRef;

export function listCallToActions(options?: ExecuteQueryOptions): QueryPromise<ListCallToActionsData, undefined>;
export function listCallToActions(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListCallToActionsData, undefined>;

interface CreateAnalyticsEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAnalyticsEventVariables): MutationRef<CreateAnalyticsEventData, CreateAnalyticsEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateAnalyticsEventVariables): MutationRef<CreateAnalyticsEventData, CreateAnalyticsEventVariables>;
  operationName: string;
}
export const createAnalyticsEventRef: CreateAnalyticsEventRef;

export function createAnalyticsEvent(vars: CreateAnalyticsEventVariables): MutationPromise<CreateAnalyticsEventData, CreateAnalyticsEventVariables>;
export function createAnalyticsEvent(dc: DataConnect, vars: CreateAnalyticsEventVariables): MutationPromise<CreateAnalyticsEventData, CreateAnalyticsEventVariables>;

interface DeleteAnalyticsEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteAnalyticsEventVariables): MutationRef<DeleteAnalyticsEventData, DeleteAnalyticsEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteAnalyticsEventVariables): MutationRef<DeleteAnalyticsEventData, DeleteAnalyticsEventVariables>;
  operationName: string;
}
export const deleteAnalyticsEventRef: DeleteAnalyticsEventRef;

export function deleteAnalyticsEvent(vars: DeleteAnalyticsEventVariables): MutationPromise<DeleteAnalyticsEventData, DeleteAnalyticsEventVariables>;
export function deleteAnalyticsEvent(dc: DataConnect, vars: DeleteAnalyticsEventVariables): MutationPromise<DeleteAnalyticsEventData, DeleteAnalyticsEventVariables>;

interface GetAnalyticsEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAnalyticsEventVariables): QueryRef<GetAnalyticsEventData, GetAnalyticsEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetAnalyticsEventVariables): QueryRef<GetAnalyticsEventData, GetAnalyticsEventVariables>;
  operationName: string;
}
export const getAnalyticsEventRef: GetAnalyticsEventRef;

export function getAnalyticsEvent(vars: GetAnalyticsEventVariables, options?: ExecuteQueryOptions): QueryPromise<GetAnalyticsEventData, GetAnalyticsEventVariables>;
export function getAnalyticsEvent(dc: DataConnect, vars: GetAnalyticsEventVariables, options?: ExecuteQueryOptions): QueryPromise<GetAnalyticsEventData, GetAnalyticsEventVariables>;

interface ListAnalyticsEventsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAnalyticsEventsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAnalyticsEventsData, undefined>;
  operationName: string;
}
export const listAnalyticsEventsRef: ListAnalyticsEventsRef;

export function listAnalyticsEvents(options?: ExecuteQueryOptions): QueryPromise<ListAnalyticsEventsData, undefined>;
export function listAnalyticsEvents(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAnalyticsEventsData, undefined>;

