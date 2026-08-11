import { CreateCampaignData, UpdateCampaignData, UpdateCampaignVariables, DeleteCampaignData, DeleteCampaignVariables, GetCampaignData, GetCampaignVariables, ListCampaignsData, CreateLandingPageData, CreateLandingPageVariables, UpdateLandingPageData, UpdateLandingPageVariables, DeleteLandingPageData, DeleteLandingPageVariables, GetLandingPageData, GetLandingPageVariables, ListLandingPagesData, CreateLeadData, CreateLeadVariables, UpdateLeadData, UpdateLeadVariables, DeleteLeadData, DeleteLeadVariables, GetLeadData, GetLeadVariables, ListLeadsData, CreateCallToActionData, CreateCallToActionVariables, UpdateCallToActionData, UpdateCallToActionVariables, DeleteCallToActionData, DeleteCallToActionVariables, GetCallToActionData, GetCallToActionVariables, ListCallToActionsData, CreateAnalyticsEventData, CreateAnalyticsEventVariables, DeleteAnalyticsEventData, DeleteAnalyticsEventVariables, GetAnalyticsEventData, GetAnalyticsEventVariables, ListAnalyticsEventsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateCampaign(options?: useDataConnectMutationOptions<CreateCampaignData, FirebaseError, void>): UseDataConnectMutationResult<CreateCampaignData, undefined>;
export function useCreateCampaign(dc: DataConnect, options?: useDataConnectMutationOptions<CreateCampaignData, FirebaseError, void>): UseDataConnectMutationResult<CreateCampaignData, undefined>;

export function useUpdateCampaign(options?: useDataConnectMutationOptions<UpdateCampaignData, FirebaseError, UpdateCampaignVariables>): UseDataConnectMutationResult<UpdateCampaignData, UpdateCampaignVariables>;
export function useUpdateCampaign(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateCampaignData, FirebaseError, UpdateCampaignVariables>): UseDataConnectMutationResult<UpdateCampaignData, UpdateCampaignVariables>;

export function useDeleteCampaign(options?: useDataConnectMutationOptions<DeleteCampaignData, FirebaseError, DeleteCampaignVariables>): UseDataConnectMutationResult<DeleteCampaignData, DeleteCampaignVariables>;
export function useDeleteCampaign(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteCampaignData, FirebaseError, DeleteCampaignVariables>): UseDataConnectMutationResult<DeleteCampaignData, DeleteCampaignVariables>;

export function useGetCampaign(vars: GetCampaignVariables, options?: useDataConnectQueryOptions<GetCampaignData>): UseDataConnectQueryResult<GetCampaignData, GetCampaignVariables>;
export function useGetCampaign(dc: DataConnect, vars: GetCampaignVariables, options?: useDataConnectQueryOptions<GetCampaignData>): UseDataConnectQueryResult<GetCampaignData, GetCampaignVariables>;

export function useListCampaigns(options?: useDataConnectQueryOptions<ListCampaignsData>): UseDataConnectQueryResult<ListCampaignsData, undefined>;
export function useListCampaigns(dc: DataConnect, options?: useDataConnectQueryOptions<ListCampaignsData>): UseDataConnectQueryResult<ListCampaignsData, undefined>;

export function useCreateLandingPage(options?: useDataConnectMutationOptions<CreateLandingPageData, FirebaseError, CreateLandingPageVariables>): UseDataConnectMutationResult<CreateLandingPageData, CreateLandingPageVariables>;
export function useCreateLandingPage(dc: DataConnect, options?: useDataConnectMutationOptions<CreateLandingPageData, FirebaseError, CreateLandingPageVariables>): UseDataConnectMutationResult<CreateLandingPageData, CreateLandingPageVariables>;

export function useUpdateLandingPage(options?: useDataConnectMutationOptions<UpdateLandingPageData, FirebaseError, UpdateLandingPageVariables>): UseDataConnectMutationResult<UpdateLandingPageData, UpdateLandingPageVariables>;
export function useUpdateLandingPage(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateLandingPageData, FirebaseError, UpdateLandingPageVariables>): UseDataConnectMutationResult<UpdateLandingPageData, UpdateLandingPageVariables>;

export function useDeleteLandingPage(options?: useDataConnectMutationOptions<DeleteLandingPageData, FirebaseError, DeleteLandingPageVariables>): UseDataConnectMutationResult<DeleteLandingPageData, DeleteLandingPageVariables>;
export function useDeleteLandingPage(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteLandingPageData, FirebaseError, DeleteLandingPageVariables>): UseDataConnectMutationResult<DeleteLandingPageData, DeleteLandingPageVariables>;

export function useGetLandingPage(vars: GetLandingPageVariables, options?: useDataConnectQueryOptions<GetLandingPageData>): UseDataConnectQueryResult<GetLandingPageData, GetLandingPageVariables>;
export function useGetLandingPage(dc: DataConnect, vars: GetLandingPageVariables, options?: useDataConnectQueryOptions<GetLandingPageData>): UseDataConnectQueryResult<GetLandingPageData, GetLandingPageVariables>;

export function useListLandingPages(options?: useDataConnectQueryOptions<ListLandingPagesData>): UseDataConnectQueryResult<ListLandingPagesData, undefined>;
export function useListLandingPages(dc: DataConnect, options?: useDataConnectQueryOptions<ListLandingPagesData>): UseDataConnectQueryResult<ListLandingPagesData, undefined>;

export function useCreateLead(options?: useDataConnectMutationOptions<CreateLeadData, FirebaseError, CreateLeadVariables>): UseDataConnectMutationResult<CreateLeadData, CreateLeadVariables>;
export function useCreateLead(dc: DataConnect, options?: useDataConnectMutationOptions<CreateLeadData, FirebaseError, CreateLeadVariables>): UseDataConnectMutationResult<CreateLeadData, CreateLeadVariables>;

export function useUpdateLead(options?: useDataConnectMutationOptions<UpdateLeadData, FirebaseError, UpdateLeadVariables>): UseDataConnectMutationResult<UpdateLeadData, UpdateLeadVariables>;
export function useUpdateLead(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateLeadData, FirebaseError, UpdateLeadVariables>): UseDataConnectMutationResult<UpdateLeadData, UpdateLeadVariables>;

export function useDeleteLead(options?: useDataConnectMutationOptions<DeleteLeadData, FirebaseError, DeleteLeadVariables>): UseDataConnectMutationResult<DeleteLeadData, DeleteLeadVariables>;
export function useDeleteLead(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteLeadData, FirebaseError, DeleteLeadVariables>): UseDataConnectMutationResult<DeleteLeadData, DeleteLeadVariables>;

export function useGetLead(vars: GetLeadVariables, options?: useDataConnectQueryOptions<GetLeadData>): UseDataConnectQueryResult<GetLeadData, GetLeadVariables>;
export function useGetLead(dc: DataConnect, vars: GetLeadVariables, options?: useDataConnectQueryOptions<GetLeadData>): UseDataConnectQueryResult<GetLeadData, GetLeadVariables>;

export function useListLeads(options?: useDataConnectQueryOptions<ListLeadsData>): UseDataConnectQueryResult<ListLeadsData, undefined>;
export function useListLeads(dc: DataConnect, options?: useDataConnectQueryOptions<ListLeadsData>): UseDataConnectQueryResult<ListLeadsData, undefined>;

export function useCreateCallToAction(options?: useDataConnectMutationOptions<CreateCallToActionData, FirebaseError, CreateCallToActionVariables>): UseDataConnectMutationResult<CreateCallToActionData, CreateCallToActionVariables>;
export function useCreateCallToAction(dc: DataConnect, options?: useDataConnectMutationOptions<CreateCallToActionData, FirebaseError, CreateCallToActionVariables>): UseDataConnectMutationResult<CreateCallToActionData, CreateCallToActionVariables>;

export function useUpdateCallToAction(options?: useDataConnectMutationOptions<UpdateCallToActionData, FirebaseError, UpdateCallToActionVariables>): UseDataConnectMutationResult<UpdateCallToActionData, UpdateCallToActionVariables>;
export function useUpdateCallToAction(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateCallToActionData, FirebaseError, UpdateCallToActionVariables>): UseDataConnectMutationResult<UpdateCallToActionData, UpdateCallToActionVariables>;

export function useDeleteCallToAction(options?: useDataConnectMutationOptions<DeleteCallToActionData, FirebaseError, DeleteCallToActionVariables>): UseDataConnectMutationResult<DeleteCallToActionData, DeleteCallToActionVariables>;
export function useDeleteCallToAction(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteCallToActionData, FirebaseError, DeleteCallToActionVariables>): UseDataConnectMutationResult<DeleteCallToActionData, DeleteCallToActionVariables>;

export function useGetCallToAction(vars: GetCallToActionVariables, options?: useDataConnectQueryOptions<GetCallToActionData>): UseDataConnectQueryResult<GetCallToActionData, GetCallToActionVariables>;
export function useGetCallToAction(dc: DataConnect, vars: GetCallToActionVariables, options?: useDataConnectQueryOptions<GetCallToActionData>): UseDataConnectQueryResult<GetCallToActionData, GetCallToActionVariables>;

export function useListCallToActions(options?: useDataConnectQueryOptions<ListCallToActionsData>): UseDataConnectQueryResult<ListCallToActionsData, undefined>;
export function useListCallToActions(dc: DataConnect, options?: useDataConnectQueryOptions<ListCallToActionsData>): UseDataConnectQueryResult<ListCallToActionsData, undefined>;

export function useCreateAnalyticsEvent(options?: useDataConnectMutationOptions<CreateAnalyticsEventData, FirebaseError, CreateAnalyticsEventVariables>): UseDataConnectMutationResult<CreateAnalyticsEventData, CreateAnalyticsEventVariables>;
export function useCreateAnalyticsEvent(dc: DataConnect, options?: useDataConnectMutationOptions<CreateAnalyticsEventData, FirebaseError, CreateAnalyticsEventVariables>): UseDataConnectMutationResult<CreateAnalyticsEventData, CreateAnalyticsEventVariables>;

export function useDeleteAnalyticsEvent(options?: useDataConnectMutationOptions<DeleteAnalyticsEventData, FirebaseError, DeleteAnalyticsEventVariables>): UseDataConnectMutationResult<DeleteAnalyticsEventData, DeleteAnalyticsEventVariables>;
export function useDeleteAnalyticsEvent(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteAnalyticsEventData, FirebaseError, DeleteAnalyticsEventVariables>): UseDataConnectMutationResult<DeleteAnalyticsEventData, DeleteAnalyticsEventVariables>;

export function useGetAnalyticsEvent(vars: GetAnalyticsEventVariables, options?: useDataConnectQueryOptions<GetAnalyticsEventData>): UseDataConnectQueryResult<GetAnalyticsEventData, GetAnalyticsEventVariables>;
export function useGetAnalyticsEvent(dc: DataConnect, vars: GetAnalyticsEventVariables, options?: useDataConnectQueryOptions<GetAnalyticsEventData>): UseDataConnectQueryResult<GetAnalyticsEventData, GetAnalyticsEventVariables>;

export function useListAnalyticsEvents(options?: useDataConnectQueryOptions<ListAnalyticsEventsData>): UseDataConnectQueryResult<ListAnalyticsEventsData, undefined>;
export function useListAnalyticsEvents(dc: DataConnect, options?: useDataConnectQueryOptions<ListAnalyticsEventsData>): UseDataConnectQueryResult<ListAnalyticsEventsData, undefined>;
