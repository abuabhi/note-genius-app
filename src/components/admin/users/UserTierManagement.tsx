
import React from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserManagement } from "./useUserManagement";
import SearchBar from "./SearchBar";
import FilterDropdown from "./FilterDropdown";
import UserTable from "./UserTable";
import { Loader } from "lucide-react";

const UserTierManagement: React.FC = () => {
  const { 
    filteredUsers, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    filter, 
    setFilter, 
    fetchUsers,
    updateUserTier,
    updateOnboardingStatus
  } = useUserManagement();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <div className="flex items-center justify-center h-[500px] w-full rounded-md border">
          <div className="flex flex-col items-center space-y-4 text-muted-foreground">
            <Loader className="h-8 w-8 animate-spin" />
            <p>Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <FilterDropdown filter={filter} setFilter={setFilter} />
      </div>
      
      <UserTable 
        users={filteredUsers} 
        updateUserTier={updateUserTier}
        updateOnboardingStatus={updateOnboardingStatus}
      />

      <div className="flex justify-end">
        <Button 
          onClick={() => {
            fetchUsers();
          }}
          disabled={loading}
        >
          {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
          Refresh Users
        </Button>
      </div>
    </div>
  );
};

export default UserTierManagement;
