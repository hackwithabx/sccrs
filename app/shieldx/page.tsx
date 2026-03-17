"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Mail, Phone, MapPin, Calendar } from "lucide-react";

interface Lead {
  _id: string;
  fullName: string;
  email: string;
  mobile: string;
  city: string;
  usageType: string;
  createdAt: string;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch("/api/admin/leads");
        const data = await res.json();
        if (data.success) {
          setLeads(data.leads);
        }
      } catch (error) {
        console.error("Failed to fetch leads", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  return (
    <div className="py-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            ShieldX Demo Leads
          </h1>
          <p className="text-muted-foreground mt-2">View users who signed up for the free ShieldX demo.</p>
        </div>
        <Badge variant="outline" className="text-lg py-1 px-4">
          {leads.length} Total Leads
        </Badge>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : leads.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            No demo leads captured yet. Go to the ShieldX page and submit the demo form!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leads.map((lead) => (
            <Card key={lead._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b bg-muted/20">
                <CardTitle className="text-lg flex justify-between items-center">
                  {lead.fullName}
                  <Badge variant={lead.usageType === "Organization" ? "default" : "secondary"} className="text-[10px]">
                    {lead.usageType}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${lead.email}`} className="text-primary hover:underline">{lead.email}</a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.mobile}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.city}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-4 pt-4 border-t">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(lead.createdAt).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}